export function initializeDatabase(db) {
  db.serialize(() => {
    // Create gamesdatabase table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS gamesdatabase (
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
      releaseYear INTEGER,
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
      isSpecial BOOLEAN DEFAULT 0,
      isKinect BOOLEAN DEFAULT 0
    )`);

    // Add other table creation statements here...
    
    console.log('Database initialized');
  });
} 