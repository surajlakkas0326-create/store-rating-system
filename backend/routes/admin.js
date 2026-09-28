const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { auth, role } = require('../middleware/auth');
const router = express.Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const validRoles = ['normal','admin','owner'];
function validate(data, withPassword=true) {
  if (!data.name || data.name.length < 20 || data.name.length > 60) return 'Name must be between 20 and 60 characters';
  if (!emailRegex.test(data.email || '')) return 'Enter a valid email';
  if (!data.address || data.address.length > 400) return 'Address is required and must be at most 400 characters';
  if (withPassword && !passwordRegex.test(data.password || '')) return 'Password must be 8-16 characters with one uppercase and one special character';
  if (!validRoles.includes(data.role)) return 'Invalid role';
}

router.get('/dashboard', auth, role('admin'), async (req,res) => {
  try {
    const [[users]] = await pool.query('SELECT COUNT(*) total FROM users');
    const [[stores]] = await pool.query('SELECT COUNT(*) total FROM stores');
    const [[ratings]] = await pool.query('SELECT COUNT(*) total FROM ratings');
    res.json({ users: users.total, stores: stores.total, ratings: ratings.total });
  } catch(err){res.status(500).json({message:err.message});}
});

router.get('/users', auth, role('admin'), async (req,res) => {
  try {
    const q = `%${req.query.q || ''}%`;
    const roleFilter = req.query.role || '';
    const sortMap = { name:'u.name', email:'u.email', address:'u.address', role:'u.role', rating:'owner_rating' };
    const sort = sortMap[req.query.sort] || 'u.name';
    const order = req.query.order === 'desc' ? 'DESC':'ASC';
    const [rows] = await pool.query(`
      SELECT u.id,u.name,u.email,u.address,u.role,
      ROUND(COALESCE((SELECT AVG(r2.rating) FROM ratings r2 JOIN stores s2 ON s2.id=r2.store_id WHERE s2.owner_id=u.id),0),2) AS owner_rating
      FROM users u
      WHERE (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ? OR u.role LIKE ?)
        AND (? = '' OR u.role = ?)
      ORDER BY ${sort} ${order}`, [q,q,q,q,roleFilter,roleFilter]);
    res.json(rows);
  }catch(err){res.status(500).json({message:err.message});}
});

router.get('/users/:id', auth, role('admin'), async (req,res)=>{
  try{
    const [rows]=await pool.query(`
      SELECT u.id,u.name,u.email,u.address,u.role,
      ROUND(COALESCE((SELECT AVG(r2.rating) FROM ratings r2 JOIN stores s2 ON s2.id=r2.store_id WHERE s2.owner_id=u.id),0),2) AS owner_rating
      FROM users u WHERE u.id=?`,[req.params.id]);
    if(!rows.length) return res.status(404).json({message:'User not found'});
    res.json(rows[0]);
  }catch(err){res.status(500).json({message:err.message});}
});

router.post('/users', auth, role('admin'), async (req,res)=>{
  try{
    const error=validate(req.body); if(error) return res.status(400).json({message:error});
    const [exists]=await pool.query('SELECT id FROM users WHERE email=?',[req.body.email]);
    if(exists.length) return res.status(400).json({message:'Email already registered'});
    const hash=await bcrypt.hash(req.body.password,10);
    await pool.query('INSERT INTO users(name,email,password,address,role) VALUES(?,?,?,?,?)',[req.body.name,req.body.email,hash,req.body.address,req.body.role]);
    res.status(201).json({message:'User added successfully'});
  }catch(err){res.status(500).json({message:err.message});}
});

router.get('/stores', auth, role('admin'), async(req,res)=>{
  try{
    const q=`%${req.query.q||''}%`; const sortMap={name:'s.name',email:'u.email',address:'s.address',rating:'average_rating'};
    const sort=sortMap[req.query.sort]||'s.name'; const order=req.query.order==='desc'?'DESC':'ASC';
    const [rows]=await pool.query(`SELECT s.id,s.name,u.email,s.address,ROUND(COALESCE(AVG(r.rating),0),2) average_rating FROM stores s JOIN users u ON s.owner_id=u.id LEFT JOIN ratings r ON s.id=r.store_id WHERE s.name LIKE ? OR u.email LIKE ? OR s.address LIKE ? GROUP BY s.id ORDER BY ${sort} ${order}`,[q,q,q]);
    res.json(rows);
  }catch(err){res.status(500).json({message:err.message});}
});

router.post('/stores', auth, role('admin'), async(req,res)=>{
  try{
    if(!req.body.name || req.body.name.length<20 || req.body.name.length>60) return res.status(400).json({message:'Store name must be between 20 and 60 characters'});
    if(!req.body.address || req.body.address.length>400) return res.status(400).json({message:'Address is required and must be at most 400 characters'});
    const [owner]=await pool.query("SELECT id FROM users WHERE id=? AND role='owner'",[req.body.owner_id]);
    if(!owner.length) return res.status(400).json({message:'Select a valid store owner'});
    await pool.query('INSERT INTO stores(name,address,owner_id) VALUES(?,?,?)',[req.body.name,req.body.address,req.body.owner_id]);
    res.status(201).json({message:'Store added successfully'});
  }catch(err){res.status(500).json({message:err.message});}
});

router.get('/owners', auth, role('admin'), async(req,res)=>{
  const [rows]=await pool.query("SELECT id,name,email FROM users WHERE role='owner' ORDER BY name"); res.json(rows);
});

module.exports=router;
