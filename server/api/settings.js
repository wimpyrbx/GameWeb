import express from 'express';
import db from '../db.js';
const router = express.Router();

router.get('/settings/:key', (req, res) => {
  const { key } = req.params;
  db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }
    res.json(row);
  });
});

router.post('/settings', (req, res) => {
  const { key, value } = req.body;
  
  if (!key || value === undefined) {
    return res.status(400).json({ error: 'Key and value are required' });
  }

  const sql = `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`;
  
  db.run(sql, [key, value], function(err) {
    if (err) {
      console.error('Error saving setting:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      key,
      value,
      message: 'Setting saved successfully'
    });
  });
});

export default router; 