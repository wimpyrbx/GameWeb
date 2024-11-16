const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create/connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'gameCollection.db'), (err) => {
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
    // Create games table
    db.run(`CREATE TABLE IF NOT EXISTS games (
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

    // Create collections table
    db.run(`CREATE TABLE IF NOT EXISTS collections (
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
app.get('/api/games', (req, res) => {
  db.all("SELECT * FROM games", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add more routes for other operations...

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 