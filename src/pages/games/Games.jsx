import React, { useState, useEffect } from 'react';
import ImportGames from '../../components/games/ImportGames';
import AddGameManual from '../../components/games/AddGameManual';
import RatingIcon from '../../components/ui/RatingIcon';
import { Edit2, Trash2 } from 'lucide-react';
import { Image } from 'lucide-react';
import { api } from '../../services/api';
import Select from 'react-select';
import EditGameModal from '../../components/games/EditGameModal';

const Games = () => {
  const [games, setGames] = useState([]);
  const [consoles, setConsoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collectionGames, setCollectionGames] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [gamesPerPage, setGamesPerPage] = useState(10);
  const itemsPerPageOptions = [10, 25, 50, 100];
  const [selectedGame, setSelectedGame] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settingsResponse, regionsResponse] = await Promise.all([
          api.getSetting('gamesdatabasePageSize'),
          api.getAllRegions()
        ]);
        
        if (settingsResponse && settingsResponse.value) {
          setGamesPerPage(parseInt(settingsResponse.value));
          loadGames(1, parseInt(settingsResponse.value));
        }
        
        setRegions(regionsResponse);
      } catch (error) {
        console.error('Error loading settings:', error);
        loadGames(1, gamesPerPage);
      }
    };
    loadSettings();
  }, []);

  const loadGames = async (page = 1, limit = gamesPerPage) => {
    try {
      setLoading(true);
      const [gamesResponse, consolesResponse, collectionResponse, ratingsResponse] = await Promise.all([
        fetch(`http://localhost:3001/api/gamesdatabase?page=${page}&limit=${limit}`),
        fetch('http://localhost:3001/api/consoles'),
        fetch('http://localhost:3001/api/collection'),
        fetch('http://localhost:3001/api/ratings')
      ]);
      
      if (!gamesResponse.ok || !consolesResponse.ok || !collectionResponse.ok || !ratingsResponse.ok) 
        throw new Error('Failed to fetch data');
      
      const [gamesData, consolesData, collectionData, ratingsData] = await Promise.all([
        gamesResponse.json(),
        consolesResponse.json(),
        collectionResponse.json(),
        ratingsResponse.json()
      ]);

      setRatings(ratingsData);
      setGames(gamesData.data);
      setConsoles(consolesData);
      setCollectionGames(collectionData.map(game => game.gameId));
      setTotalPages(gamesData.pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames(currentPage);
  }, [currentPage]);

  const handleGameAdded = () => {
    loadGames(currentPage);
  };

  const getConsoleName = (consoleId) => {
    return consoles.find(c => c.id === consoleId)?.name || 'Unknown Console';
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatNOKPrice = (price) => {
    if (!price) return '-';
    return `Nok ${Math.floor(price)}`;
  };

  const handleDelete = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/gamesdatabase/${gameId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete game');
      
      loadGames(currentPage); // Reload the games list
    } catch (error) {
      setError(error.message);
    }
  };

  const getRatingInfo = (ratingId) => {
    const rating = ratings.find(r => r.id === ratingId);
    return rating ? rating.name : null;
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = async (newValue) => {
    const value = parseInt(newValue);
    setGamesPerPage(value);
    setCurrentPage(1);
    
    try {
      await api.saveSetting('gamesdatabasePageSize', value.toString());
      loadGames(1, value);
    } catch (error) {
      console.error('Error saving setting:', error);
      setError('Failed to save display setting');
    }
  };

  const handleEdit = (game) => {
    setSelectedGame(game);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedGame) => {
    try {
      const response = await fetch(`http://localhost:3001/api/gamesdatabase/${updatedGame.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedGame),
      });

      if (!response.ok) throw new Error('Failed to update game');

      loadGames(currentPage);
      setShowEditModal(false);
      setSelectedGame(null);
    } catch (error) {
      console.error('Error updating game:', error);
      // You might want to show an error message to the user here
    }
  };

  const PaginationControls = () => (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <div>
        <button 
          className="btn btn-outline-primary me-2"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || loading}
        >
          First
        </button>
        <button 
          className="btn btn-outline-primary me-2"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          Previous
        </button>
      </div>
      <div className="text-muted">
        Page {currentPage} of {totalPages}
      </div>
      <div>
        <button 
          className="btn btn-outline-primary me-2"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        >
          Next
        </button>
        <button 
          className="btn btn-outline-primary"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
        >
          Last
        </button>
      </div>
    </div>
  );

  return (
    <div className="content-wrapper">
      <div className="content-body">
        <div className="row">
          <div className="col-md-6">
            <ImportGames onImportComplete={handleGameAdded} />
          </div>
          <div className="col-md-6">
            <AddGameManual onGameAdded={handleGameAdded} />
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3>Games Database ({games.length} Games)</h3>
                <Select
                  value={{ value: gamesPerPage, label: `${gamesPerPage} items` }}
                  onChange={(option) => handleItemsPerPageChange(option.value)}
                  options={[
                    { value: 10, label: '10 items' },
                    { value: 25, label: '25 items' },
                    { value: 50, label: '50 items' }
                  ]}
                  className="items-per-page-select"
                  classNamePrefix="items-per-page"
                  isSearchable={false}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '31px',
                      height: '31px'
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      height: '31px',
                      padding: '0 8px'
                    }),
                    input: (base) => ({
                      ...base,
                      margin: '0px'
                    }),
                    indicatorSeparator: () => ({
                      display: 'none'
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      padding: '4px'
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 999
                    })
                  }}
                />
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center">Loading games...</div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : games.length === 0 ? (
                  <div className="text-center">No games in database</div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th style={{ width: '46px' }}></th>
                            <th style={{ width: 'auto' }}>Title</th>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Information</th>
                            <th style={{ whiteSpace: 'nowrap', textAlign: 'left', width: '136px' }}>Loose</th>
                            <th style={{ whiteSpace: 'nowrap', textAlign: 'left', width: '136px' }}>CIB</th>
                            <th style={{ whiteSpace: 'nowrap', textAlign: 'left', width: '136px' }}>New</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {games.map(game => (
                            <tr 
                              key={game.id} 
                              onClick={() => handleEdit(game)}
                              style={{ cursor: 'pointer' }}
                              className="hover-highlight"
                            >
                              <td style={{ width: '46px', padding: 0 }}>
                                {game.coverUrl ? (
                                  <img 
                                    src={game.coverUrl} 
                                    alt={game.title}
                                    style={{ 
                                      width: '46px',
                                      height: '60px',
                                      objectFit: 'cover',
                                      display: 'block'
                                    }}
                                  />
                                ) : (
                                  <div style={{ 
                                    width: '46px',
                                    height: '60px',
                                    background: '#f8f9fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: 0
                                  }}>
                                    <Image size={24} className="text-muted" />
                                  </div>
                                )}
                              </td>
                              <td style={{ position: 'relative', paddingLeft: '8px', textAlign: 'left', width: 'fit-content' }}>
                                <div style={{ 
                                  fontSize: '13px',
                                  marginBottom: '4px'
                                }}>
                                  {game.title}
                                </div>
                                <div style={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  {game.ratingId ? (
                                    <div style={{ height: '14px' }}>
                                      {getRatingInfo(game.ratingId) ? (
                                        <RatingIcon rating={getRatingInfo(game.ratingId)} />
                                      ) : (
                                        <span className="badge bg-dark text-white" style={{ 
                                          fontSize: '11px',
                                          borderRadius: '4px',
                                          padding: '2px 6px'
                                        }}>
                                          {game.ratingId}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="badge bg-dark text-white" style={{ 
                                      fontSize: '11px',
                                      borderRadius: '4px',
                                      padding: '2px 6px'
                                    }}>
                                      {game.regionId === 1 ? 'PAL' : 'NTSC'}
                                    </span>
                                  )}
                                  {Boolean(game.isKinect) && (
                                    <img 
                                      src="/logos/kinect.webp" 
                                      alt="Kinect Game"
                                      style={{ height: '14px' }}
                                    />
                                  )}
                                </div>
                              </td>
                              <td style={{ whiteSpace: 'nowrap', width: 'fit-content' }}>
                                <small>
                                  <div>{game.releaseYear || '-'} / {game.genre || '-'}</div>
                                  <div>Developer: {game.developer || '-'}</div>
                                  <div>Publisher: {game.publisher || '-'}</div>
                                </small>
                              </td>
                              <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: '136px' }}>
                                <small>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>USD:</span>
                                    <span>$<strong>{formatPrice(game.Loose_USD)}</strong></span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>NOK:</span>
                                    <span><strong>{formatNOKPrice(game.Loose_NOK)}</strong></span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>FIXED:</span>
                                    <span><strong>{formatNOKPrice(game.Loose_NOK2)}</strong></span>
                                  </div>
                                </small>
                              </td>
                              <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: '136px' }}>
                                <small>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>USD:</span>
                                    <span>$<strong>{formatPrice(game.CIB_USD)}</strong></span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>NOK:</span>
                                    <span><strong>{formatNOKPrice(game.CIB_NOK)}</strong></span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>FIXED:</span>
                                    <span><strong>{formatNOKPrice(game.CIB_NOK2)}</strong></span>
                                  </div>
                                </small>
                              </td>
                              <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: '136px' }}>
                                <small>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>USD:</span>
                                    <span>$<strong>{formatPrice(game.NEW_USD)}</strong></span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>NOK:</span>
                                    <span><strong>{formatNOKPrice(game.NEW_NOK)}</strong></span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>FIXED:</span>
                                    <span><strong>{formatNOKPrice(game.NEW_NOK2)}</strong></span>
                                  </div>
                                </small>
                              </td>
                              <td>
                                <div className="d-flex gap-2 justify-content-center">
                                  <Trash2 
                                    size={14} 
                                    className={`text-danger ${collectionGames.includes(game.id) ? 'opacity-50' : 'cursor-pointer'}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      !collectionGames.includes(game.id) && handleDelete(game.id);
                                    }}
                                    style={{ 
                                      cursor: collectionGames.includes(game.id) ? 'not-allowed' : 'pointer'
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <PaginationControls />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .prices-column {
            font-size: 0.75rem;
            line-height: 1.2;
            text-align: left;
            width: fit-content;
          }
          .price-row > small > div {
            white-space: nowrap;
            color: #666;
            text-align: left;
          }
          .table th {
            padding: 0.75rem;
            height: auto;
            white-space: nowrap;
            vertical-align: middle;
          }
          .table td {
            padding: 0.5rem;
            vertical-align: middle;
            max-height: 60px;
            overflow: hidden;
          }
          .table tr {
            max-height: 60px;
            height: 60px;
          }
          .table td:first-child {
            padding: 0 !important;
          }
          .table td > div {
            max-height: 60px;
            overflow: hidden;
          }
          /* Add styles for price column grouping */
          .table th:nth-child(4),
          .table td:nth-child(4) {
            background-color: #f8f9fa;
            border-left: 1px solid #dee2e6;
          }
          .table th:nth-child(6),
          .table td:nth-child(6) {
            background-color: #f8f9fa;
            border-right: 1px solid #dee2e6;
          }
          .table th:nth-child(5),
          .table td:nth-child(5) {
            background-color: #f8f9fa;
          }
          /* Add a subtle header style for the price group */
          .table thead th:nth-child(4),
          .table thead th:nth-child(5),
          .table thead th:nth-child(6) {
            background-color: #f1f3f5;
            border-bottom: 2px solid #dee2e6;
          }
          /* Exclude header row from fixed height */
          .table thead tr {
            height: auto;
            max-height: none;
          }
          .hover-highlight:hover {
            background-color: rgba(0,0,0,0.05);
          }
        `}
      </style>

      {showEditModal && (
        <EditGameModal
          show={showEditModal}
          game={selectedGame}
          regions={regions}
          ratings={ratings}
          consoles={consoles}
          onSave={handleSaveEdit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedGame(null);
          }}
        />
      )}
    </div>
  );
};

export default Games; 