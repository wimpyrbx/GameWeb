import React, { useState, useEffect } from 'react';
import { gamesDB, consoleDB, regionDB } from '../../services/db';
import ImportGames from '../../components/games/ImportGames';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import CollectionCard from '../../components/ui/CollectionCard';
import { Grid, List, Database } from 'lucide-react';

const Games = () => {
  const [games, setGames] = useState([]);
  const [consoles, setConsoles] = useState([]);
  const [regions, setRegions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [newGame, setNewGame] = useState({
    title: '',
    consoleId: '',
    regionId: '',
    rating: '',
    pricechartingId: '',
    pricechartingUrl: '',
    coverUrl: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allGames, allConsoles, allRegions] = await Promise.all([
        gamesDB.getAllGames(),
        consoleDB.getAllConsoles(),
        regionDB.getAllRegions()
      ]);
      setGames(allGames);
      setConsoles(allConsoles);
      setRegions(allRegions);
    } catch (error) {
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      const gameId = await gamesDB.addGame({
        ...newGame,
        consoleId: Number(newGame.consoleId),
        regionId: Number(newGame.regionId)
      });
      
      setSuccess(`Game "${newGame.title}" added successfully with ID: ${gameId}`);
      setNewGame({
        title: '',
        consoleId: '',
        regionId: '',
        rating: '',
        pricechartingId: '',
        pricechartingUrl: '',
        coverUrl: ''
      });
      loadData();
    } catch (error) {
      setError('Error adding game: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await gamesDB.deleteGame(id);
      setSuccess(`Game "${title}" deleted successfully`);
      loadData();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGame = (game) => {
    console.log('Edit game:', game);
    alert('Edit functionality coming soon!');
  };

  const renderCollectionItems = () => {
    if (viewMode === 'card') {
      return (
        <div className="collection-cards-grid">
          {games.map(game => {
            const console = consoles.find(c => c.id === game.consoleId);
            const prices = {
              loose: parseFloat(game.Pricecharting_Loose) || null,
              cib: parseFloat(game.Pricecharting_Complete) || null,
              new: parseFloat(game.Pricecharting_New) || null,
              box: parseFloat(game.Pricecharting_BoxOnly) || null,
              manual: parseFloat(game.Pricecharting_ManualOnly) || null
            };
            
            return (
              <CollectionCard
                key={game.id}
                item={{
                  id: game.id,
                  gameDetails: {
                    title: game.title,
                    consoleName: console?.name || 'Unknown Console',
                    coverUrl: game.coverUrl,
                    pricechartingId: game.pricechartingId,
                    pricechartingUrl: game.pricechartingUrl,
                    displayName: `${console?.name || 'Unknown Console'} <span class="text-muted mx-2">/</span> ${game.title}`
                  },
                  addedDate: game.releaseDate,
                  boxCondition: game.boxCondition || '3',
                  discCondition: game.discCondition || '3',
                  manualCondition: game.manualCondition || '3',
                  prices: prices,
                  cibPrice: prices.cib,
                  price_override: game.price_override
                }}
                onDelete={handleDeleteGame}
                onEdit={() => handleEditGame(game)}
                loading={loading}
              />
            );
          })}
        </div>
      );
    }

    return (
      <ResponsiveTable 
        columns={[
          { header: 'Title', key: 'title' },
          { header: 'Console', key: 'console', render: (game) => consoles.find(c => c.id === game.consoleId)?.name },
          { header: 'Region', key: 'region', render: (game) => regions.find(r => r.id === game.regionId)?.name },
          { header: 'Rating', key: 'rating' },
          { header: 'Pricecharting', key: 'pricechartingUrl', render: (game) => game.pricechartingUrl && (
            <a href={game.pricechartingUrl} target="_blank" rel="noopener noreferrer">View</a>
          )},
          { header: 'Cover', key: 'coverUrl', render: (game) => game.coverUrl && (
            <img src={game.coverUrl} alt={game.title} style={{ height: '30px', width: 'auto' }} />
          )},
          { header: 'Actions', key: 'actions', render: (game) => (
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDeleteGame(game.id, game.title)}
              disabled={loading}
            >
              Delete
            </button>
          )}
        ]}
        data={games}
        isMobile={window.innerWidth <= 1024}
        emptyMessage={loading ? 'Loading games...' : 'No games in database'}
      />
    );
  };

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="d-flex align-items-center">
          <Database size={24} className="me-3" style={{ position: 'relative', top: '-1px' }} />
          <h2 className="mb-0">Games Database</h2>
        </div>
      </div>

      <ImportGames onImportComplete={loadData} />

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="close" onClick={() => setError('')}>
            <span>&times;</span>
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="close" onClick={() => setSuccess('')}>
            <span>&times;</span>
          </button>
        </div>
      )}

      <div className="content-body">
        <div className="card mb-4">
          <div className="card-header">
            <h3>Add New Game to Database</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddGame} className="row g-3">
              <div className="col-md-4">
                <div className="form-group">
                  <label>Game Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter game title"
                    value={newGame.title}
                    onChange={(e) => setNewGame({...newGame, title: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Console</label>
                  <select
                    className="form-control"
                    value={newGame.consoleId}
                    onChange={(e) => setNewGame({...newGame, consoleId: e.target.value})}
                    required
                  >
                    <option value="">Select Console</option>
                    {consoles.map(console => (
                      <option key={console.id} value={console.id}>
                        {console.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Region</label>
                  <select
                    className="form-control"
                    value={newGame.regionId}
                    onChange={(e) => setNewGame({...newGame, regionId: e.target.value})}
                    required
                  >
                    <option value="">Select Region</option>
                    {regions.map(region => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Rating</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Game rating"
                    value={newGame.rating}
                    onChange={(e) => setNewGame({...newGame, rating: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Pricecharting ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pricecharting ID"
                    value={newGame.pricechartingId}
                    onChange={(e) => setNewGame({...newGame, pricechartingId: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-8">
                <div className="form-group">
                  <label>Pricecharting URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://www.pricecharting.com/game/..."
                    value={newGame.pricechartingUrl}
                    onChange={(e) => setNewGame({...newGame, pricechartingUrl: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label>Cover URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="Cover image URL"
                    value={newGame.coverUrl}
                    onChange={(e) => setNewGame({...newGame, coverUrl: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-12">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Game'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <h3 className="mb-0">Games Database List</h3>
                <span className="badge badge-info ms-3">{games.length} Games</span>
              </div>
              <div>
                <button 
                  className={`btn ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-secondary'} me-2`}
                  onClick={() => setViewMode('card')}
                >
                  <Grid size={16} className="me-2" style={{ position: 'relative', top: '-1px' }} /> Card View
                </button>
                <button 
                  className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('table')}
                >
                  <List size={16} className="me-2" style={{ position: 'relative', top: '-1px' }} /> Table View
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            {renderCollectionItems()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games; 