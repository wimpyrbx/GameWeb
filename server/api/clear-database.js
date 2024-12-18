// Use callbacks to ensure sequential execution
db.run(`DROP TABLE IF EXISTS gamesdatabase`, (err) => {
  if (err) {
    console.error('Error dropping table:', err);
    throw err;
  }

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
    if (err) {
      console.error('Error creating table:', err);
      throw err;
    }
    console.log('Database cleared and recreated successfully');
  });
}); 