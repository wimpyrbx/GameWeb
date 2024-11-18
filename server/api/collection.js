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

// Add this new endpoint for getting final prices
router.get('/collection/prices', async (req, res) => {
  try {
    // First get all collection items with their game details
    const sql = `
      SELECT 
        c.*,
        g.Loose_NOK2,
        g.CIB_NOK2,
        g.NEW_NOK2,
        g.title
      FROM collection c
      LEFT JOIN gamesdatabase g ON c.gameId = g.id
    `;

    db.all(sql, [], (err, items) => {
      if (err) {
        console.error('Error fetching collection prices:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      // Calculate final price for each item
      const itemsWithPrices = items.map(item => {
        let finalPrice = null;
        let priceType = null;

        // Check price override first
        if (item.price_override) {
          finalPrice = item.price_override;
          priceType = 'Override';
        }
        // Check if item is CIB (all conditions are present and not 'missing')
        else if (
          item.boxCondition && item.boxCondition !== 'missing' &&
          item.manualCondition && item.manualCondition !== 'missing' &&
          item.discCondition && item.discCondition !== 'missing'
        ) {
          finalPrice = item.CIB_NOK2;
          priceType = 'CIB';
        }
        // If not CIB, use Loose price
        else if (item.Loose_NOK2) {
          finalPrice = item.Loose_NOK2;
          priceType = 'Loose';
        }
        // No valid price available
        else {
          finalPrice = null;
          priceType = 'No Price';
        }

        return {
          id: item.id,
          gameId: item.gameId,
          title: item.title,
          finalPrice,
          priceType,
          conditions: {
            box: item.boxCondition,
            manual: item.manualCondition,
            disc: item.discCondition
          }
        };
      });

      res.json({
        items: itemsWithPrices,
        summary: {
          total: itemsWithPrices.reduce((sum, item) => sum + (item.finalPrice || 0), 0),
          itemCount: itemsWithPrices.length,
          itemsWithPrice: itemsWithPrices.filter(item => item.finalPrice !== null).length,
          itemsWithoutPrice: itemsWithPrices.filter(item => item.finalPrice === null).length
        }
      });
    });
  } catch (error) {
    console.error('Error in collection prices endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 