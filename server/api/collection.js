import express from 'express';
import db from '../db.js';
const router = express.Router();

router.get('/collection', (req, res) => {
  db.all('SELECT * FROM collection', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post('/collection', (req, res) => {
  const { 
    gameId, 
    consoleId,
    regionId,
    boxCondition, 
    manualCondition, 
    discCondition,
    price_override,
    isSpecial,
    isKinect,
    addedDate
  } = req.body;
  
  if (!gameId) {
    return res.status(400).json({ error: 'Game ID is required' });
  }

  const sql = `INSERT INTO collection (
    gameId, consoleId, regionId, boxCondition, manualCondition, 
    discCondition, price_override, isSpecial, isKinect, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [
    gameId,
    consoleId || null,
    regionId || null,
    boxCondition || null,
    manualCondition || null,
    discCondition || null,
    price_override || null,
    isSpecial || 0,
    isKinect || 0,
    addedDate || new Date().toISOString()
  ], function(err) {
    if (err) {
      console.error('Error adding to collection:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({
      id: this.lastID,
      gameId,
      consoleId,
      regionId,
      boxCondition,
      manualCondition,
      discCondition,
      price_override,
      isSpecial,
      isKinect,
      created_at: addedDate || new Date().toISOString()
    });
  });
});

router.delete('/collection/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM collection WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Item removed from collection successfully' });
  });
});

router.put('/collection/:id', (req, res) => {
  const { id } = req.params;
  const { condition, purchaseDate, purchasePrice, notes } = req.body;
  
  const sql = `UPDATE collection 
               SET condition = ?, purchaseDate = ?, purchasePrice = ?, notes = ?
               WHERE id = ?`;
               
  db.run(sql, [condition, purchaseDate, purchasePrice, notes, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      id,
      condition,
      purchaseDate,
      purchasePrice,
      notes,
      message: 'Collection item updated successfully'
    });
  });
});

export default router; 