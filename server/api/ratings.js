import express from 'express';
const router = express.Router();
import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Initialize database connection
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const db = new sqlite3.Database(join(__dirname, '../gameCollection.db'), (err) => {
  if (err) {
    console.error('Error connecting to SQLite database in ratings:', err);
  } else {
    console.log('Connected to SQLite database for ratings');
  }
});

// GET all ratings
router.get('/ratings', (req, res) => {
  console.log('GET /ratings called');
  const sql = 'SELECT * FROM ratings';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching ratings:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST a new rating
router.post('/ratings', (req, res) => {
  const { name, system, description, region } = req.body;

  if (!name || !system || !region) {
    return res.status(400).json({ error: 'Name, system, and region are required' });
  }

  const sql = `INSERT INTO ratings (name, system, description, region) VALUES (?, ?, ?, ?)`;
  const values = [name, system, description || null, region];

  db.run(sql, values, function(err) {
    if (err) {
      console.error('Error inserting rating:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({
      id: this.lastID,
      name,
      system,
      description: description || null,
      region
    });
  });
});

// DELETE a rating by ID
router.delete('/ratings/:id', (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM ratings WHERE id = ?`;
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Error deleting rating:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Rating not found' });
      return;
    }

    res.json({ message: 'Rating deleted successfully' });
  });
});

// Modify the region endpoint
router.get('/ratings/region/:regionId', (req, res) => {
  const { regionId } = req.params;
  console.log(`GET /ratings/region/${regionId} called`);
  
  const sql = 'SELECT * FROM ratings WHERE region = ?';
  const regionIdNum = parseInt(regionId, 10); // Convert to number
  
  console.log('Executing SQL:', sql, 'with regionId:', regionIdNum);
  
  db.all(sql, [regionIdNum], (err, rows) => {
    if (err) {
      console.error('Error fetching ratings by region:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('Found ratings:', rows);
    res.json(rows);
  });
});

export default router; 