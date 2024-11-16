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
    <div className="card h-100">
      <div className="card-header">
        <div className="d-flex align-items-center">
          <FileSpreadsheet size={20} className="me-2" />
          <h3 className="mb-0">Import Games</h3>
        </div>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger small py-2">
            <AlertCircle size={14} className="me-1" />
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success small py-2">
            <CheckCircle2 size={14} className="me-1" />
            {success}
          </div>
        )}
        
        <div className="form-group">
          <input
            type="file"
            className="form-control form-control-sm"
            accept=".txt,.tsv"
            onChange={handleImport}
            disabled={importing}
          />
          <button 
            className="btn btn-link btn-sm mt-1 p-0 text-decoration-none"
            onClick={() => setShowDetails(!showDetails)}
            type="button"
          >
            {showDetails ? (
              <><ChevronUp size={14} className="me-1" /> Hide format details</>
            ) : (
              <><ChevronDown size={14} className="me-1" /> Show format details</>
            )}
          </button>
        </div>

        {importing && (
          <div className="mt-2">
            <div className="progress" style={{ height: '2px' }}>
              <div 
                className="progress-bar" 
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <small className="text-muted d-block mt-1">
              {progress.current} / {progress.total}
              {progress.failed > 0 && ` (${progress.failed} failed)`}
            </small>
          </div>
        )}

        {showDetails && (
          <div className="import-format-guide mt-3">
            <div className="format-section">
              <div className="format-header">
                <h6 className="mb-3">File Format Requirements</h6>
              </div>
              
              <div className="format-columns">
                <div className="required-columns">
                  <div className="column-type-label">Required Fields</div>
                  <div className="column-list">
                    <div className="column-item">
                      <span className="column-badge required">ProductName</span>
                      <span className="column-desc">Game title (e.g., "Halo 3")</span>
                    </div>
                    <div className="column-item">
                      <span className="column-badge rating">PEGI_Final</span>
                      <span className="column-desc">Age rating (e.g., "PEGI 16")</span>
                    </div>
                    <div className="column-item">
                      <span className="column-badge url">PricechartingUrl</span>
                      <span className="column-desc">Full URL to pricecharting.com page</span>
                    </div>
                  </div>
                </div>
                
                <div className="optional-columns">
                  <div className="column-type-label">Optional Fields</div>
                  <div className="column-list">
                    <div className="column-item">
                      <span className="column-badge optional">CoverUrl</span>
                      <span className="column-desc">URL to game cover image</span>
                    </div>
                    <div className="column-item">
                      <span className="column-badge optional">PricechartingID</span>
                      <span className="column-desc">Numeric ID from pricecharting.com</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="format-example mt-3">
                <div className="example-header">
                  Example Format
                </div>
                <div className="example-content">
                  <code>ProductName[tab]PEGI_Final[tab]PricechartingUrl[tab]CoverUrl[tab]PricechartingID</code>
                </div>
              </div>

              <div className="format-note mt-3">
                <AlertCircle size={14} className="me-2" />
                Fields must be separated by tabs. Column headers must match exactly.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportGames; 