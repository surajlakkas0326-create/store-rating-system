const express = require('express');
const pool = require('../config/db');
const { auth, role } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, role('normal'), async (req, res) => {
  try {
    const search = `%${req.query.search || ''}%`;
    const sortMap = { name: 's.name', address: 's.address', rating: 'average_rating' };
    const sort = sortMap[req.query.sort] || 's.name';
    const order = req.query.order === 'desc' ? 'DESC' : 'ASC';
    const [rows] = await pool.query(`
      SELECT s.id, s.name, s.address,
      ROUND(COALESCE(AVG(r.rating),0),2) AS average_rating,
      COALESCE(MAX(CASE WHEN r.user_id = ? THEN r.rating END), 0) AS my_rating
      FROM stores s LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.name LIKE ? OR s.address LIKE ?
      GROUP BY s.id ORDER BY ${sort} ${order}`, [req.user.id, search, search]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/rating', auth, role('normal'), async (req, res) => {
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  try {
    const [store] = await pool.query('SELECT id FROM stores WHERE id = ?', [req.params.id]);
    if (!store.length) return res.status(404).json({ message: 'Store not found' });
    await pool.query(`INSERT INTO ratings (user_id, store_id, rating) VALUES (?,?,?) ON DUPLICATE KEY UPDATE rating = VALUES(rating)`, [req.user.id, req.params.id, rating]);
    res.json({ message: 'Rating saved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
