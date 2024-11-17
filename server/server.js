import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from 'body-parser';
import db from './db.js';
import { initializeDatabase } from './dbInit.js';

// Import routes
import gamesRoutes from './api/games.js';
import exchangeRatesRoutes from './api/exchangeRates.js';
import settingsRoutes from './api/settings.js';
import consolesRoutes from './api/consoles.js';
import regionsRoutes from './api/regions.js';
import collectionRoutes from './api/collection.js';
import imagesRoutes from './api/images.js';
import ratingsRoutes from './api/ratings.js';
import databaseRoutes from './api/database.js';
import manualSQLRouter from './api/manualSQL.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

// Initialize database
initializeDatabase(db);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Use routes
app.use('/api', gamesRoutes);
app.use('/api', exchangeRatesRoutes);
app.use('/api', settingsRoutes);
app.use('/api', consolesRoutes);
app.use('/api', regionsRoutes);
app.use('/api', collectionRoutes);
app.use('/api', imagesRoutes);
app.use('/api', ratingsRoutes);
app.use('/api', databaseRoutes);
app.use('/api', manualSQLRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 