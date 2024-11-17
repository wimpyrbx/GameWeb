import express from 'express';
import sqlite3 from 'sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Create a separate database connection for manual SQL
const db = new sqlite3.Database(join(__dirname, '../gameCollection.db'), (err) => {
  if (err) {
    console.error('Error connecting to SQLite database in manual SQL:', err);
  } else {
    console.log('Connected to SQLite database for manual SQL');
  }
});

// POST /api/execute-sql
router.post('/execute-sql', (req, res) => {
  console.log('Received SQL query request:', req.body);
  
  const { query } = req.body;

  if (!query) {
    const error = 'No query provided';
    console.log('Error:', error);
    return res.status(400).json({ 
      message: error,
      success: false
    });
  }

  // Determine if it's a SELECT query or a modification query
  const isSelect = query.trim().toUpperCase().startsWith('SELECT');

  try {
    if (isSelect) {
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('SQL Error:', err);
          return res.status(400).json({
            success: false,
            message: err.message,
            query: query
          });
        }

        console.log('Query executed successfully:', {
          rowCount: rows?.length || 0,
          query: query
        });

        res.json({
          success: true,
          data: rows || [],
          message: `Query returned ${rows?.length || 0} rows`,
          query: query
        });
      });
    } else {
      db.run(query, [], function(err) {
        if (err) {
          console.error('SQL Error:', err);
          return res.status(400).json({
            success: false,
            message: err.message,
            query: query
          });
        }

        console.log('Query executed successfully:', {
          changes: this.changes,
          lastID: this.lastID,
          query: query
        });

        res.json({
          success: true,
          message: `Query executed successfully. Rows affected: ${this.changes}`,
          changes: this.changes,
          lastID: this.lastID,
          query: query
        });
      });
    }
  } catch (error) {
    console.error('Execution Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      query: query
    });
  }
});

export default router; 