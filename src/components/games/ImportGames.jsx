import React, { useState } from 'react';
import { gamesDB, consoleDB, regionDB, pricesDB } from '../../services/db';
import { determineRegion, parseGamesList } from '../../utils/importHelpers';
import { FileSpreadsheet, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const ImportGames = ({ onImportComplete }) => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, failed: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImporting(true);
      setError('');
      setSuccess('');
      setProgress({ current: 0, total: 0, failed: 0 });

      const text = await file.text();
      const games = parseGamesList(text);
      
      setProgress(prev => ({ ...prev, total: games.length }));

      const [consoles, regions] = await Promise.all([
        consoleDB.getAllConsoles(),
        regionDB.getAllRegions()
      ]);

      const xbox360 = consoles.find(c => c.name === 'Xbox 360');
      if (!xbox360) {
        throw new Error('Xbox 360 console not found in database');
      }

      let successCount = 0;
      let failedCount = 0;
      const errors = [];

      // Process each game
      for (let i = 0; i < games.length; i++) {
        const gameData = games[i];
        
        try {
          const regionName = determineRegion(gameData.rating);
          const region = regions.find(r => r.name === regionName);
          
          if (!region) {
            throw new Error(`Region ${regionName} not found for game ${gameData.title}`);
          }

          // Add the game first
          const gameId = await gamesDB.addGame({
            title: gameData.title,
            consoleId: xbox360.id,
            regionId: region.id,
            rating: gameData.rating,
            pricechartingId: gameData.pricechartingId,
            pricechartingUrl: gameData.pricechartingUrl,
            coverUrl: gameData.coverUrl
          });

          // Then add the prices if they exist
          if (gameData.prices && gameData.pricechartingId) {
            await pricesDB.addPrice({
              pricechartingId: gameData.pricechartingId,
              ...gameData.prices,
              date: new Date().toISOString()
            });
          }
          
          successCount++;
        } catch (error) {
          failedCount++;
          errors.push(`Failed to import "${gameData.title}": ${error.message}`);
        }

        setProgress(prev => ({ 
          ...prev, 
          current: i + 1,
          failed: failedCount
        }));
      }

      if (successCount > 0) {
        setSuccess(`Successfully imported ${successCount} games with prices`);
      }
      if (failedCount > 0) {
        setError(`Failed to import ${failedCount} games:\n${errors.join('\n')}`);
      }

      if (onImportComplete) onImportComplete();
    } catch (error) {
      setError('Import failed: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="content-body">
      <div className="card mb-4">
        <div className="card-header d-flex align-items-center">
          <FileSpreadsheet size={20} className="me-2" />
          <h3>Import Games</h3>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" style={{ whiteSpace: 'pre-line' }}>
              <AlertCircle size={18} className="me-2" />
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} className="me-2" />
              {success}
            </div>
          )}
          
          <div className="form-group mb-4">
            <label>Import Games List (Tab-separated text file)</label>
            <input
              type="file"
              className="form-control"
              accept=".txt,.tsv"
              onChange={handleImport}
              disabled={importing}
            />
            <button 
              className="btn btn-link mt-2 p-0 text-decoration-none"
              onClick={() => setShowDetails(!showDetails)}
              type="button"
            >
              {showDetails ? (
                <><ChevronUp size={16} className="me-1" /> Hide format details</>
              ) : (
                <><ChevronDown size={16} className="me-1" /> Show format details</>
              )}
            </button>
          </div>

          {showDetails && (
            <div className="import-legend p-3 bg-light rounded border">
              <h5 className="text-primary mb-3">Required File Format</h5>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-muted mb-2">Required Columns:</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2 d-flex align-items-center">
                      <span className="badge bg-danger me-3">ProductName</span>
                      <small>Game title (e.g., "Halo 3")</small>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <span className="badge bg-warning me-3">PEGI_Final</span>
                      <small>Age rating (e.g., "PEGI 16")</small>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <span className="badge bg-success me-3">PricechartingUrl</span>
                      <small>Full URL to pricecharting.com page</small>
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted mb-2">Optional Columns:</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2 d-flex align-items-center">
                      <span className="badge bg-info me-3">CoverUrl</span>
                      <small>URL to game cover image</small>
                    </li>
                    <li className="mb-2 d-flex align-items-center">
                      <span className="badge bg-secondary me-3">PricechartingID</span>
                      <small>Numeric ID from pricecharting.com</small>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-white rounded border">
                <h6 className="text-muted mb-2">Example Format:</h6>
                <div className="example-format" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  <div className="d-flex gap-3 mb-1">
                    <span className="badge bg-danger">ProductName</span>
                    <span className="badge bg-warning">PEGI_Final</span>
                    <span className="badge bg-success">PricechartingUrl</span>
                    <span className="badge bg-info">CoverUrl</span>
                    <span className="badge bg-secondary">PricechartingID</span>
                  </div>
                  <div className="text-muted" style={{ wordBreak: 'break-all' }}>
                    <span className="text-danger">Halo 3</span> &nbsp;&nbsp;
                    <span className="text-warning">PEGI 16</span> &nbsp;&nbsp;
                    <span className="text-success">https://www.pricecharting.com/game/...</span> &nbsp;&nbsp;
                    <span className="text-info">https://example.com/cover.jpg</span> &nbsp;&nbsp;
                    <span className="text-secondary">12345</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 alert alert-warning mb-0">
                <AlertCircle size={14} className="me-2" />
                <small>
                  Columns must be separated by tabs. Headers must match exactly as shown above.
                </small>
              </div>
            </div>
          )}

          {importing && (
            <div className="mt-4">
              <div className="progress">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  aria-valuenow={progress.current}
                  aria-valuemin="0" 
                  aria-valuemax={progress.total}
                >
                  {progress.current} / {progress.total}
                </div>
              </div>
              <small className="text-muted d-block mt-2">
                Processed: {progress.current} / {progress.total} 
                {progress.failed > 0 && ` (${progress.failed} failed)`}
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportGames; 