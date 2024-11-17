import express from 'express';
import db from '../db.js';
const router = express.Router();

router.get('/exchange-rate/:currency', (req, res) => {
  const { currency } = req.params;
  db.get(
    'SELECT * FROM exchange_rates WHERE currency = ? ORDER BY timestamp DESC LIMIT 1', 
    [currency], 
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Exchange rate not found' });
        return;
      }
      res.json(row);
    }
  );
});

export default router; 