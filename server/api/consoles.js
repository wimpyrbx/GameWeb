import express from 'express';
import db from '../db.js';
const router = express.Router();

router.get('/consoles', (req, res) => {
  db.all('SELECT * FROM consoles', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post('/consoles', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Console name is required' });
  }
  
  const sql = `INSERT INTO consoles (name) VALUES (?)`;
  
  db.run(sql, [name], function(err) {
    if (err) {
      console.error('Error inserting console:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({
      id: this.lastID,
      name
    });
  });
});

router.delete('/consoles/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM consoles WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Console deleted successfully' });
  });
});

export default router; 