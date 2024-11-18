import express from 'express';
const router = express.Router();
import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Initialize database connection
const __filename = fileURLToPath(import.meta.url);
const __dirnameLocal = dirname(__filename);
const db = new sqlite3.Database(join(__dirnameLocal, '../gameCollection.db'), (err) => {
  if (err) {
    console.error('Error connecting to SQLite database in database routes:', err);
  } else {
    console.log('Connected to SQLite database for database routes');
  }
});

// GET all table names
router.get('/tables', (req, res) => {
  const sql = "SELECT name FROM sqlite_master WHERE type='table'";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching tables:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.name));
  });
});

// GET all data from a specific table
router.get('/:table', (req, res) => {
  const { table } = req.params;
  const sql = `SELECT * FROM ${table}`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(`Error fetching data from ${table}:`, err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET table schema
router.get('/schema/:table', (req, res) => {
  const { table } = req.params;
  const sql = `PRAGMA table_info(${table})`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(`Error fetching schema for ${table}:`, err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST to clear a specific table
router.post('/clear-table/:table', async (req, res) => {
  const { table } = req.params;

  // List of protected tables that shouldn't be cleared
  const protectedTables = ['sqlite_sequence', 'settings', 'exchange_rates', 'ratings'];

  if (protectedTables.includes(table)) {
    return res.status(403).json({ error: `Cannot clear protected table: ${table}` });
  }

  try {
    // Verify the table exists
    const tableExists = await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
        [table],
        (err, row) => {
          if (err) reject(err);
          resolve(row ? true : false);
        }
      );
    });

    if (!tableExists) {
      return res.status(404).json({ error: `Table ${table} not found` });
    }

    // Clear the table
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM ${table}`, [], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Reset the auto-increment counter
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM sqlite_sequence WHERE name = ?`, [table], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    res.json({ message: `Table ${table} cleared successfully` });
  } catch (error) {
    console.error(`Error clearing table ${table}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// POST to clear the entire database (specific tables)
router.post('/clear-database', async (req, res) => {
  // List of tables that can be cleared (excluding protected tables)
  const clearableTables = ['gamesdatabase', 'collection'];

  try {
    // Clear each table in sequence
    for (const table of clearableTables) {
      if (table === 'gamesdatabase') {
        // Special handling for gamesdatabase to ensure proper recreation
        await new Promise((resolve, reject) => {
          db.run(`DROP TABLE IF EXISTS gamesdatabase`, (err) => {
            if (err) reject(err);
            
            db.run(`
              CREATE TABLE gamesdatabase (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                consoleId INTEGER,
                regionId INTEGER,
                ratingId INTEGER,
                pricechartingId TEXT,
                pricechartingUrl TEXT,
                coverUrl TEXT,
                developer TEXT,
                publisher TEXT,
                releaseYear TEXT,
                genre TEXT,
                Loose_USD REAL,
                CIB_USD REAL,
                NEW_USD REAL,
                BOX_USD REAL,
                MANUAL_USD REAL,
                Loose_NOK REAL,
                CIB_NOK REAL,
                NEW_NOK REAL,
                BOX_NOK REAL,
                MANUAL_NOK REAL,
                Loose_NOK2 REAL,
                CIB_NOK2 REAL,
                NEW_NOK2 REAL,
                BOX_NOK2 REAL,
                MANUAL_NOK2 REAL,
                isSpecial INTEGER DEFAULT 0,
                isKinect INTEGER DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime'))
              )
            `, (err) => {
              if (err) reject(err);
              resolve();
            });
          });
        });
      } else if (table === 'collection') {
        // Special handling for collection table
        await new Promise((resolve, reject) => {
          db.run(`DROP TABLE IF EXISTS collection`, (err) => {
            if (err) reject(err);
            
            db.run(`
              CREATE TABLE collection (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gameId INTEGER NOT NULL,
                consoleId INTEGER,
                regionId INTEGER,
                boxCondition TEXT,
                discCondition TEXT,
                manualCondition TEXT,
                price_override REAL,
                created_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime'))
              )
            `, (err) => {
              if (err) reject(err);
              resolve();
            });
          });
        });
      }
    }
    
    res.json({ message: 'Database cleared successfully' });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 