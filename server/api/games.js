import express from 'express';
import db from '../db.js';
const router = express.Router();

router.get('/gamesdatabase', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  console.log('Fetching games from database...', { page, limit, offset });

  // First get total count
  db.get('SELECT COUNT(*) as total FROM gamesdatabase', [], (err, countResult) => {
    if (err) {
      console.error('Error counting games:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    // Then get paginated data
    const sql = `
      SELECT g.*, r.name as ratingName, r.system as ratingSystem
      FROM gamesdatabase g
      LEFT JOIN ratings r ON g.ratingId = r.id
      ORDER BY g.title
      LIMIT ? OFFSET ?
    `;
    
    db.all(sql, [limit, offset], (err, rows) => {
      if (err) {
        console.error('Error fetching games:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(`Found ${rows.length} games for page ${page}`);
      res.json({
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    });
  });
});

router.post('/gamesdatabase', (req, res) => {
  db.get("SELECT COUNT(*) as count FROM gamesdatabase", [], (err, result) => {
    if (err) {
      console.error('Error checking table:', err);
      res.status(500).json({ error: 'Database error checking table' });
      return;
    }

    console.log('Current games in database:', result.count);

    const sql = `INSERT INTO gamesdatabase (
      title, consoleId, regionId, ratingId,
      pricechartingId, pricechartingUrl, coverUrl,
      developer, publisher, releaseYear, genre,
      Loose_USD, CIB_USD, NEW_USD, BOX_USD, MANUAL_USD,
      Loose_NOK, CIB_NOK, NEW_NOK, BOX_NOK, MANUAL_NOK,
      Loose_NOK2, CIB_NOK2, NEW_NOK2, BOX_NOK2, MANUAL_NOK2,
      isSpecial, isKinect
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      req.body.title,
      req.body.consoleId,
      req.body.regionId,
      req.body.ratingId,
      req.body.pricechartingId,
      req.body.pricechartingUrl,
      req.body.coverUrl,
      req.body.developer,
      req.body.publisher,
      req.body.releaseYear,
      req.body.genre,
      req.body.Loose_USD,
      req.body.CIB_USD,
      req.body.NEW_USD,
      req.body.BOX_USD,
      req.body.MANUAL_USD,
      req.body.Loose_NOK,
      req.body.CIB_NOK,
      req.body.NEW_NOK,
      req.body.BOX_NOK,
      req.body.MANUAL_NOK,
      req.body.Loose_NOK2,
      req.body.CIB_NOK2,
      req.body.NEW_NOK2,
      req.body.BOX_NOK2,
      req.body.MANUAL_NOK2,
      req.body.isSpecial || 0,
      req.body.isKinect || 0
    ];

    db.run(sql, values, function(err) {
      if (err) {
        console.error('Insert failed:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({ 
        id: this.lastID,
        message: 'Game added successfully'
      });
    });
  });
});

router.delete('/gamesdatabase/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT COUNT(*) as count FROM collection WHERE gameId = ?', [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (result.count > 0) {
      res.status(400).json({ error: 'Cannot delete game that is in collection' });
      return;
    }

    db.run('DELETE FROM gamesdatabase WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Game deleted successfully' });
    });
  });
});

router.post('/gamesdatabase/check', (req, res) => {
  const { title, consoleId, pricechartingUrl } = req.body;

  db.get(
    'SELECT * FROM gamesdatabase WHERE LOWER(title) = LOWER(?) AND consoleId = ?',
    [title, consoleId],
    (err, titleMatch) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (titleMatch) {
        res.json({ 
          exists: true, 
          message: 'A game with this title already exists for this console' 
        });
        return;
      }

      if (pricechartingUrl) {
        db.get(
          'SELECT * FROM gamesdatabase WHERE pricechartingUrl = ?',
          [pricechartingUrl],
          (err, urlMatch) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            if (urlMatch) {
              res.json({ 
                exists: true, 
                message: 'This PriceCharting URL is already registered to another game' 
              });
              return;
            }

            res.json({ exists: false });
          }
        );
      } else {
        res.json({ exists: false });
      }
    }
  );
});

router.get('/prices/latest/:pricechartingId', (req, res) => {
  const { pricechartingId } = req.params;
  
  const sql = `
    SELECT 
      Loose_USD, CIB_USD, NEW_USD, BOX_USD, MANUAL_USD,
      Loose_NOK, CIB_NOK, NEW_NOK, BOX_NOK, MANUAL_NOK,
      Loose_NOK2, CIB_NOK2, NEW_NOK2, BOX_NOK2, MANUAL_NOK2
    FROM gamesdatabase 
    WHERE pricechartingId = ?
    LIMIT 1
  `;
  
  db.get(sql, [pricechartingId], (err, row) => {
    if (err) {
      console.error('Error fetching prices:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'No prices found for this game' });
      return;
    }
    
    res.json(row);
  });
});

router.put('/gamesdatabase/:id', (req, res) => {
  const { id } = req.params;
  const {
    title,
    regionId,
    ratingId,
    isKinect,
    isSpecial,
    releaseYear,
    developer,
    publisher,
    genre
  } = req.body;

  const sql = `
    UPDATE gamesdatabase 
    SET title = ?, regionId = ?, ratingId = ?, 
        isKinect = ?, isSpecial = ?, releaseYear = ?,
        developer = ?, publisher = ?, genre = ?
    WHERE id = ?
  `;

  const values = [
    title,
    regionId,
    ratingId,
    isKinect ? 1 : 0,
    isSpecial ? 1 : 0,
    releaseYear || null,
    developer || null,
    publisher || null,
    genre || null,
    id
  ];

  db.run(sql, values, function(err) {
    if (err) {
      console.error('Error updating game:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    res.json({ 
      message: 'Game updated successfully',
      id: id
    });
  });
});

export default router; 