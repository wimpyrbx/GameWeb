import express from 'express';
import db from '../db.js';
const router = express.Router();

router.get('/regions', (req, res) => {
  console.log('GET /regions called');
  db.all('SELECT * FROM regions', [], (err, rows) => {
    if (err) {
      console.error('Error fetching regions:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(rows);
  });
});

router.post('/regions', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Region name is required' });
  }
  
  db.run('INSERT INTO regions (name) VALUES (?)', [name], function(err) {
    if (err) {
      console.error('Error inserting region:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name });
  });
});

router.delete('/regions/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM regions WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Region deleted successfully' });
  });
});

export default router; 