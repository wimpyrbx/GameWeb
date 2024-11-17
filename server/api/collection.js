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
    boxCondition, 
    manualCondition, 
    discCondition,
    isCib,
    isNew,
    isPromo,
    notes,
    PriceOverride
  } = req.body;
  
  if (!gameId) {
    return res.status(400).json({ error: 'Game ID is required' });
  }

  const sql = `INSERT INTO collection (
    gameId, boxCondition, manualCondition, discCondition,
    isCib, isNew, isPromo, notes, PriceOverride
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [
    gameId,
    boxCondition || null,
    manualCondition || null,
    discCondition || null,
    isCib ? 1 : 0,
    isNew ? 1 : 0,
    isPromo ? 1 : 0,
    notes || null,
    PriceOverride || null
  ], function(err) {
    if (err) {
      console.error('Error adding to collection:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({
      id: this.lastID,
      gameId,
      boxCondition,
      manualCondition,
      discCondition,
      isCib,
      isNew,
      isPromo,
      notes,
      PriceOverride,
      dateAdded: new Date().toISOString()
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