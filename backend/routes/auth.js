const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

function validateUser(data, passwordRequired = true) {
  const { name, email, address, password } = data;
  if (!name || name.length < 20 || name.length > 60) return 'Name must be between 20 and 60 characters';
  if (!email || !emailRegex.test(email)) return 'Enter a valid email';
  if (!address || address.length > 400) return 'Address is required and must be at most 400 characters';
  if (passwordRequired && (!password || !passwordRegex.test(password))) return 'Password must be 8-16 characters with one uppercase and one special character';
  return null;
}

router.post('/signup', async (req, res) => {
  try {
    const error = validateUser(req.body);
    if (error) return res.status(400).json({ message: error });

    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [req.body.email]);
    if (exists.length) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(req.body.password, 10);
    await pool.query('INSERT INTO users (name,email,password,address,role) VALUES (?,?,?,?,?)', [req.body.name, req.body.email, hash, req.body.address, 'normal']);
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id,name,email,password,address,role FROM users WHERE email = ?', [req.body.email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid email or password' });
    const user = rows[0];
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET || 'store_rating_secret_123', { expiresIn: '1d' });
    delete user.password;
    res.json({ token, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/password', auth, async (req, res) => {
  try {
    if (!passwordRegex.test(req.body.password || '')) return res.status(400).json({ message: 'Password must be 8-16 characters with one uppercase and one special character' });
    const hash = await bcrypt.hash(req.body.password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
