import React, { useState, useEffect } from 'react';
import { gamesDB, consoleDB, regionDB, collectionDB } from '../../services/db';
import ImportGames from '../../components/games/ImportGames';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import CollectionCard from '../../components/ui/CollectionCard';
import { Grid, List, Database, Trash2 } from 'lucide-react';
import RatingIcon from '../../components/ui/RatingIcon';

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
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [collectionItems, setCollectionItems] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allGames, allConsoles, allRegions, allCollectionItems] = await Promise.all([
        gamesDB.getAllGames(),
        consoleDB.getAllConsoles(),
        regionDB.getAllRegions(),
        collectionDB.getAllCollectionItems()
      ]);
      setGames(allGames);
      setConsoles(allConsoles);
      setRegions(allRegions);
      setCollectionItems(allCollectionItems);
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

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };

  const getPaginationRange = (currentPage, totalPages) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    range.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }

    // Always show last page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Add dots where needed
    let l;
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const isGameInCollection = (gameId) => {
    return collectionItems.some(item => item.gameId === gameId);
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
          { 
            header: 'Title', 
            key: 'title',
            render: (game) => game.pricechartingUrl ? (
              <a href={game.pricechartingUrl} target="_blank" rel="noopener noreferrer">
                {game.title}
              </a>
            ) : game.title
          },
          { 
            header: 'Console', 
            key: 'console', 
            width: '100px',
            render: (game) => consoles.find(c => c.id === game.consoleId)?.name 
          },
          { 
            header: 'Region', 
            key: 'region',
            width: '80px',
            render: (game) => (
              <div className="d-flex align-items-center justify-content-between">
                <span style={{ minWidth: '35px' }}>{regions.find(r => r.id === game.regionId)?.name}</span>
                <div style={{ 
                  height: '16px',
                  marginLeft: '4px',
                  display: 'flex',
                  alignItems: 'center' 
                }}>
                  <RatingIcon rating={game.rating} />
                </div>
              </div>
            )
          },
          { 
            header: 'Prices',
            key: 'prices-group-start',
            width: '80px',
            className: 'text-center price-column price-column-start',
            render: (game) => (
              <div className="text-center">
                {game.Pricecharting_Loose ? `$${game.Pricecharting_Loose}` : '-'}
              </div>
            )
          },
          { 
            header: 'CIB', 
            key: 'cib', 
            width: '80px',
            className: 'text-center price-column',
            render: (game) => (
              <div className="text-center">
                {game.Pricecharting_Complete ? `$${game.Pricecharting_Complete}` : '-'}
              </div>
            )
          },
          { 
            header: 'New', 
            key: 'new', 
            width: '80px',
            className: 'text-center price-column',
            render: (game) => (
              <div className="text-center">
                {game.Pricecharting_New ? `$${game.Pricecharting_New}` : '-'}
              </div>
            )
          },
          { 
            header: 'Box', 
            key: 'box', 
            width: '80px',
            className: 'text-center price-column',
            render: (game) => (
              <div className="text-center">
                {game.Pricecharting_BoxOnly ? `$${game.Pricecharting_BoxOnly}` : '-'}
              </div>
            )
          },
          { 
            header: 'Manual', 
            key: 'manual', 
            width: '80px',
            className: 'text-center price-column price-column-end',
            render: (game) => (
              <div className="text-center">
                {game.Pricecharting_ManualOnly ? `$${game.Pricecharting_ManualOnly}` : '-'}
              </div>
            )
          },
          { 
            header: '',
            key: 'actions',
            width: '32px',
            padding: '4px',
            render: (game) => {
              const inCollection = isGameInCollection(game.id);
              return (
                <div style={{ 
                  width: '32px', 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 8px'
                }}>
                  <Trash2 
                    size={14} 
                    className={`${inCollection ? 'text-muted' : 'text-danger'} cursor-pointer`}
                    onClick={() => !inCollection && handleDeleteGame(game.id, game.title)}
                    style={{ 
                      opacity: loading || inCollection ? 0.5 : 1,
                      cursor: inCollection ? 'not-allowed' : (loading ? 'wait' : 'pointer')
                    }}
                    title={inCollection ? 'Cannot delete - Game is in collection' : 'Delete game'}
                  />
                </div>
              );
            }
          }
        ]}
        data={getPaginatedData(games)}
        isMobile={window.innerWidth <= 1024}
        emptyMessage={loading ? 'Loading games...' : 'No games in database'}
        style={{ 
          fontSize: '0.875rem',
          lineHeight: '1.2'
        }}
      />
    );
  };

  return (
    <div className="content-wrapper">
      <div className="content-body">
        <div className="row mb-4">
          <div className="col-md-4">
            <ImportGames onImportComplete={loadData} />
          </div>
          
          <div className="col-md-8">
            <div className="card">
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
          </div>
        </div>

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

        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Database size={20} className="pe-2" />
                <h3 className="mb-0">Games Database ({games.length} Game{games.length !== 1 ? 's' : ''})</h3>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="table-controls mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="entries-control">
                  Show 
                  <select 
                    className="form-select form-select-sm mx-2 d-inline-block" 
                    style={{ width: 'auto' }}
                    value={pageSize}
                    onChange={handlePageSizeChange}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  entries
                </div>
                <div className="pagination-info">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, games.length)} of {games.length} entries
                </div>
              </div>
            </div>
            
            <ResponsiveTable 
              columns={[
                { 
                  header: 'Title', 
                  key: 'title',
                  render: (game) => game.pricechartingUrl ? (
                    <a href={game.pricechartingUrl} target="_blank" rel="noopener noreferrer">
                      {game.title}
                    </a>
                  ) : game.title
                },
                { 
                  header: 'Console', 
                  key: 'console', 
                  width: '100px',
                  render: (game) => consoles.find(c => c.id === game.consoleId)?.name 
                },
                { 
                  header: 'Region', 
                  key: 'region',
                  width: '80px',
                  render: (game) => (
                    <div className="d-flex align-items-center justify-content-between">
                      <span style={{ minWidth: '35px' }}>{regions.find(r => r.id === game.regionId)?.name}</span>
                      <div style={{ 
                        height: '16px',
                        marginLeft: '4px',
                        display: 'flex',
                        alignItems: 'center' 
                      }}>
                        <RatingIcon rating={game.rating} />
                      </div>
                    </div>
                  )
                },
                { 
                  header: 'Prices',
                  key: 'prices-group-start',
                  width: '80px',
                  className: 'text-center price-column price-column-start',
                  render: (game) => (
                    <div className="text-center">
                      {game.Pricecharting_Loose ? `$${game.Pricecharting_Loose}` : '-'}
                    </div>
                  )
                },
                { 
                  header: 'CIB', 
                  key: 'cib', 
                  width: '80px',
                  className: 'text-center price-column',
                  render: (game) => (
                    <div className="text-center">
                      {game.Pricecharting_Complete ? `$${game.Pricecharting_Complete}` : '-'}
                    </div>
                  )
                },
                { 
                  header: 'New', 
                  key: 'new', 
                  width: '80px',
                  className: 'text-center price-column',
                  render: (game) => (
                    <div className="text-center">
                      {game.Pricecharting_New ? `$${game.Pricecharting_New}` : '-'}
                    </div>
                  )
                },
                { 
                  header: 'Box', 
                  key: 'box', 
                  width: '80px',
                  className: 'text-center price-column',
                  render: (game) => (
                    <div className="text-center">
                      {game.Pricecharting_BoxOnly ? `$${game.Pricecharting_BoxOnly}` : '-'}
                    </div>
                  )
                },
                { 
                  header: 'Manual', 
                  key: 'manual', 
                  width: '80px',
                  className: 'text-center price-column price-column-end',
                  render: (game) => (
                    <div className="text-center">
                      {game.Pricecharting_ManualOnly ? `$${game.Pricecharting_ManualOnly}` : '-'}
                    </div>
                  )
                },
                { 
                  header: '',
                  key: 'actions',
                  width: '32px',
                  padding: '4px',
                  render: (game) => {
                    const inCollection = isGameInCollection(game.id);
                    return (
                      <div style={{ 
                        width: '32px', 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 8px'
                      }}>
                        <Trash2 
                          size={14} 
                          className={`${inCollection ? 'text-muted' : 'text-danger'} cursor-pointer`}
                          onClick={() => !inCollection && handleDeleteGame(game.id, game.title)}
                          style={{ 
                            opacity: loading || inCollection ? 0.5 : 1,
                            cursor: inCollection ? 'not-allowed' : (loading ? 'wait' : 'pointer')
                          }}
                          title={inCollection ? 'Cannot delete - Game is in collection' : 'Delete game'}
                        />
                      </div>
                    );
                  }
                }
              ]}
              data={getPaginatedData(games)}
              isMobile={window.innerWidth <= 1024}
              emptyMessage={loading ? 'Loading games...' : 'No games in database'}
              style={{ 
                fontSize: '0.875rem',
                lineHeight: '1.2'
              }}
            />

            {games.length > pageSize && (
              <div className="d-flex justify-content-center mt-3">
                <nav aria-label="Table navigation">
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {getPaginationRange(currentPage, Math.ceil(games.length / pageSize)).map((page, index) => (
                      <li 
                        key={index} 
                        className={`page-item ${currentPage === page ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                      >
                        <button 
                          className="page-link" 
                          onClick={() => page !== '...' && handlePageChange(page)}
                          disabled={page === '...'}
                        >
                          {page}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === Math.ceil(games.length / pageSize) ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === Math.ceil(games.length / pageSize)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games; 