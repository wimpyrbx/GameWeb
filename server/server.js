import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create/connect to SQLite database
const db = new sqlite3.Database(join(__dirname, 'gameCollection.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create games table (renamed to gamesdatabase)
    db.run(`CREATE TABLE IF NOT EXISTS gamesdatabase (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      consoleId INTEGER,
      regionId INTEGER,
      rating TEXT,
      pricechartingId TEXT,
      pricechartingUrl TEXT,
      coverUrl TEXT,
      developer TEXT,
      publisher TEXT,
      releaseDate TEXT,
      genre TEXT
    )`);

    // Create consoles table
    db.run(`CREATE TABLE IF NOT EXISTS consoles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`);

    // Create regions table
    db.run(`CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`);

    // Create prices table
    db.run(`CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pricechartingId TEXT,
      loose REAL,
      cib REAL,
      new REAL,
      box REAL,
      manual REAL,
      date TEXT
    )`);

    // Create collections table (renamed to collection)
    db.run(`CREATE TABLE IF NOT EXISTS collection (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gameId INTEGER,
      consoleId INTEGER,
      regionId INTEGER,
      addedDate TEXT,
      boxCondition TEXT,
      discCondition TEXT,
      manualCondition TEXT,
      price_override REAL
    )`);

    // Create settings table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`);

    // Add initial data
    db.get("SELECT COUNT(*) as count FROM consoles", [], (err, row) => {
      if (err) {
        console.error(err);
        return;
      }
      if (row.count === 0) {
        db.run("INSERT INTO consoles (name) VALUES (?)", ["Xbox 360"]);
      }
    });

    db.get("SELECT COUNT(*) as count FROM regions", [], (err, row) => {
      if (err) {
        console.error(err);
        return;
      }
      if (row.count === 0) {
        db.run("INSERT INTO regions (name) VALUES (?)", ["PAL"]);
        db.run("INSERT INTO regions (name) VALUES (?)", ["NTSC-U"]);
        db.run("INSERT INTO regions (name) VALUES (?)", ["NTSC-J"]);
      }
    });
  });
}

// API Routes
app.get('/api/gamesdatabase', (req, res) => {
  db.all("SELECT * FROM gamesdatabase", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/gamesdatabase', (req, res) => {
  const { title, consoleId, regionId, rating, pricechartingId, pricechartingUrl, coverUrl } = req.body;
  db.run(
    `INSERT INTO gamesdatabase (title, consoleId, regionId, rating, pricechartingId, pricechartingUrl, coverUrl) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, consoleId, regionId, rating, pricechartingId, pricechartingUrl, coverUrl],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get('/api/consoles', (req, res) => {
  db.all("SELECT * FROM consoles", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/consoles', (req, res) => {
  const { name } = req.body;
  db.run("INSERT INTO consoles (name) VALUES (?)", [name], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.get('/api/regions', (req, res) => {
  db.all("SELECT * FROM regions", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/regions', (req, res) => {
  const { name } = req.body;
  db.run("INSERT INTO regions (name) VALUES (?)", [name], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.get('/api/collection', (req, res) => {
  db.all("SELECT * FROM collection", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/collection', (req, res) => {
  const { gameId, consoleId, regionId, addedDate, boxCondition, discCondition, manualCondition, price_override } = req.body;
  db.run(
    `INSERT INTO collection (gameId, consoleId, regionId, addedDate, boxCondition, discCondition, manualCondition, price_override) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [gameId, consoleId, regionId, addedDate, boxCondition, discCondition, manualCondition, price_override],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get('/api/prices', (req, res) => {
  db.all("SELECT * FROM prices", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/prices', (req, res) => {
  const { pricechartingId, loose, cib, new: newPrice, box, manual, date } = req.body;
  db.run(
    `INSERT INTO prices (pricechartingId, loose, cib, new, box, manual, date) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [pricechartingId, loose, cib, newPrice, box, manual, date],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get('/api/settings/:key', (req, res) => {
  const { key } = req.params;
  db.get("SELECT value FROM settings WHERE key = ?", [key], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ value: row ? row.value : null });
  });
});

app.post('/api/settings', (req, res) => {
  const { key, value } = req.body;
  db.run(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = ?`,
    [key, value, value],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

app.get('/api/settings', (req, res) => {
  db.all("SELECT * FROM settings", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/clear-database', (req, res) => {
  db.serialize(() => {
    // Drop all tables
    db.run("DROP TABLE IF EXISTS gamesdatabase");
    db.run("DROP TABLE IF EXISTS consoles");
    db.run("DROP TABLE IF EXISTS regions");
    db.run("DROP TABLE IF EXISTS prices");
    db.run("DROP TABLE IF EXISTS collection");
    db.run("DROP TABLE IF EXISTS settings");

    // Reinitialize the database
    initializeDatabase();

    res.json({ success: true });
  });
});

app.get('/api/prices/latest/:pricechartingId', (req, res) => {
  const { pricechartingId } = req.params;
  db.all(
    `SELECT * FROM prices 
     WHERE pricechartingId = ? 
     ORDER BY date DESC 
     LIMIT 1`,
    [pricechartingId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows[0] || null);
    }
  );
});

app.delete('/api/collection/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM collection WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 