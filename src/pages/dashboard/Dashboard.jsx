import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import { collectionDB, gamesDB, pricesDB, consoleDB, saveSetting, getSetting } from '../../services/db';
import Select from 'react-select'; // Import react-select for modern dropdowns
import Sidebar from '../../components/layout/Sidebar'; // Import Sidebar
import CollectionCard from '../../components/ui/CollectionCard';
import { 
  Edit2, 
  Grid, 
  List, 
  Gamepad, 
  Plus, 
  Library,
  Database,
  Trash2
} from 'lucide-react'; // Import icons for view switching
import EditGameModal from '../../components/games/EditGameModal';
import AddGameModal from '../../components/games/AddGameModal';
import CollectionItemModal from '../../components/collection/CollectionItemModal';

const Dashboard = () => {
  const [collection, setCollection] = useState([]);
  const [games, setGames] = useState([]);
  const [consoles, setConsoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewType, setViewType] = useState('card'); // State to manage view type
  const [formData, setFormData] = useState({
    gameId: '',
    boxCondition: '3',
    manualCondition: '3',
    discCondition: '3'
  });
  const [editingGame, setEditingGame] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [modalData, setModalData] = useState({
    isOpen: false,
    game: null,
    existingItem: null,
    isAdd: false
  });
  const [success, setSuccess] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10); // New state for items per page
  const [currentPage, setCurrentPage] = useState(1); // New state for current page
  const [showKinectOnly, setShowKinectOnly] = useState(false);
  const [showSpecialOnly, setShowSpecialOnly] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const [savedViewType, savedPageSize, savedKinectFilter, savedSpecialFilter] = await Promise.all([
        getSetting('collectionViewType'),
        getSetting('collectionPageSize'),
        getSetting('collectionFilterKinect'),
        getSetting('collectionFilterSpecial')
      ]);
      
      setViewType(savedViewType || 'card');
      setItemsPerPage(savedPageSize ? parseInt(savedPageSize) : 10);
      setShowKinectOnly(savedKinectFilter === '1');
      setShowSpecialOnly(savedSpecialFilter === '1');
      loadData();
    };
    loadSettings();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allGames, allConsoles, collectionItems] = await Promise.all([
        gamesDB.getAllGames(),
        consoleDB.getAllConsoles(),
        collectionDB.getAllCollectionItems()
      ]);

      // First, create a map of games by ID for easy lookup
      const gamesMap = allGames.reduce((acc, game) => {
        acc[game.id] = game;
        return acc;
      }, {});

      // Enhance collection items with game details
      const enhancedCollectionItems = collectionItems.map(item => ({
        ...item,
        gameDetails: gamesMap[item.gameId] || null
      }));

      // Fetch CIB prices for all games in the collection
      const pricesPromises = enhancedCollectionItems.map(item => 
        item.gameDetails?.pricechartingId ? 
          pricesDB.getLatestPrice(item.gameDetails.pricechartingId) : 
          Promise.resolve(null)
      );
      const prices = await Promise.all(pricesPromises);

      // Map prices back to collection items
      const updatedCollection = enhancedCollectionItems.map((item, index) => ({
        ...item,
        cibPrice: prices[index] ? prices[index].cib : null
      }));

      setGames(allGames);
      setConsoles(allConsoles);
      setCollection(updatedCollection);
    } catch (error) {
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async (formData) => {
    try {
      setLoading(true);
      
      const collectionItem = {
        gameId: parseInt(formData.gameId),
        consoleId: games.find(g => g.id === parseInt(formData.gameId))?.consoleId,
        regionId: games.find(g => g.id === parseInt(formData.gameId))?.regionId,
        addedDate: new Date().toISOString(),
        boxCondition: formData.boxCondition,
        discCondition: formData.discCondition,
        manualCondition: formData.manualCondition,
        price_override: null
      };

      await collectionDB.addCollectionItem(collectionItem);
      setShowAddModal(false);
      await loadData();
    } catch (error) {
      setError('Failed to add game to collection: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = async (type) => {
    setViewType(type);
    setItemsPerPage(10);
    setCurrentPage(1);
    await saveSetting('collectionViewType', type);
  };

  const handleConditionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteCollectionItem = async (id) => {
    if (!window.confirm('Are you sure you want to remove this game from your collection?')) {
      return;
    }

    try {
      setLoading(true);
      await collectionDB.deleteCollectionItem(id);
      await loadData(); // Reload the collection after deletion
    } catch (error) {
      setError('Failed to delete collection item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    const game = games.find(g => g.id === item.gameId);
    if (!game) return;

    setModalData({
      isOpen: true,
      game: game,
      existingItem: item,
      isAdd: false
    });
  };

  const handleModalSave = async (formData) => {
    try {
      setLoading(true);
      
      if (modalData.isAdd) {
        // Create the collection item object
        const collectionItem = {
          gameId: modalData.game.id,
          consoleId: modalData.game.consoleId,
          regionId: modalData.game.regionId,
          boxCondition: formData.boxCondition,
          discCondition: formData.discCondition,
          manualCondition: formData.manualCondition,
          price_override: formData.price_override || null,
          isSpecial: formData.isSpecial || 0,
          isKinect: formData.isKinect || 0,
          addedDate: new Date().toISOString()
        };

        // Use the api service to add the item
        await api.addCollection(collectionItem);
        setSuccess(`Added "${modalData.game.title}" to collection`);
      } else {
        // Handle edit case
        await api.updateCollectionItem(modalData.existingItem.id, formData);
        setSuccess(`Updated "${modalData.game.title}" in collection`);
      }
      
      await loadData(); // Reload the collection data
      setModalData({ isOpen: false, game: null, existingItem: null, isAdd: false });
    } catch (error) {
      console.error('Error saving collection item:', error);
      setError('Failed to save: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterCollectionItems = (items) => {
    if (!searchQuery && !showKinectOnly && !showSpecialOnly) return items;
    
    return items.filter(item => {
      const game = games.find(g => g.id === item.gameId);
      const console = consoles.find(c => c.id === item.consoleId);
      let matches = true;

      if (searchQuery) {
        const searchString = `${game?.title || ''} ${console?.name || ''}`.toLowerCase();
        matches = matches && searchString.includes(searchQuery.toLowerCase());
      }

      if (showKinectOnly) {
        matches = matches && item.isKinect === 1;
      }

      if (showSpecialOnly) {
        matches = matches && item.isSpecial === 1;
      }

      return matches;
    });
  };

  const renderCollectionItems = () => {
    const filteredItems = filterCollectionItems(collection);
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    
    if (viewType === 'card') {
      return (
        <>
          <div className="collection-cards-grid">
            {paginatedItems.map(item => {
              const game = games.find(g => g.id === item.gameId);
              const console = consoles.find(c => c.id === item.consoleId);
              
              return (
                <CollectionCard
                  key={item.id}
                  item={{
                    ...item,
                    gameDetails: {
                      title: game?.title || 'Unknown Game',
                      consoleName: console?.name || 'Unknown Console',
                      coverUrl: game?.coverUrl,
                      pricechartingId: game?.pricechartingId,
                      pricechartingUrl: game?.pricechartingUrl,
                      displayName: `${console?.name || 'Unknown Console'} <span class="text-muted mx-2">/</span> ${game?.title || 'Unknown Game'}`
                    }
                  }}
                  onDelete={handleDeleteCollectionItem}
                  onEdit={handleEdit}
                  loading={loading}
                />
              );
            })}
          </div>
          <div className="d-flex justify-content-end align-items-center mt-4">
            <nav aria-label="Collection pagination">
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      );
    }

    return (
      <>
        <Table 
          data={paginatedItems}
          columns={[
            { 
              header: 'Game', 
              key: 'title',
              render: (item) => {
                const game = games.find(g => g.id === item.gameId);
                const console = consoles.find(c => c.id === item.consoleId);
                return `${console?.name || 'Unknown Console'} / ${game?.title || 'Unknown Game'}`;
              }
            },
            { 
              header: 'Added On', 
              key: 'addedDate', 
              render: (item) => new Date(item.addedDate).toLocaleDateString() 
            },
            { 
              header: 'CIB Price', 
              key: 'cibPrice', 
              render: (item) => item.cibPrice !== null ? `$${item.cibPrice}` : '-' 
            },
            { 
              header: 'Final Price', 
              key: 'finalPrice', 
              render: (item) => item.price_override ? `$${item.price_override} (Override)` : item.cibPrice ? `$${item.cibPrice} (CIB)` : '-'
            },
            { 
              header: 'Actions', 
              key: 'actions',
              width: '100px',
              render: (item) => (
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleEdit(item)}
                    disabled={loading}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteCollectionItem(item.id)}
                    disabled={loading}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            }
          ]}
        />
        <div className="d-flex justify-content-end align-items-center mt-4">
          <nav aria-label="Collection pagination">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </>
    );
  };

  const getGameOptions = () => {
    return games.map(game => {
      const console = consoles.find(c => c.id === game.consoleId);
      return {
        value: game.id,
        label: `${game.title} (${console?.name || 'Unknown Console'})`,
        game: game
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  };

  const handleQuickAdd = () => {
    if (!selectedGame) return;
    
    setModalData({
      isOpen: true,
      game: selectedGame.game,
      existingItem: null,
      isAdd: true
    });
  };

  const toggleKinectFilter = async () => {
    const newValue = !showKinectOnly;
    setShowKinectOnly(newValue);
    await saveSetting('collectionFilterKinect', newValue ? '1' : '0');
  };

  const toggleSpecialFilter = async () => {
    const newValue = !showSpecialOnly;
    setShowSpecialOnly(newValue);
    await saveSetting('collectionFilterSpecial', newValue ? '1' : '0');
  };

  return (
    <div className="content-wrapper">
      <Sidebar />
      <div className="content-body">
        <div className="card mb-4">
          <div className="card-header">
            <div className="d-flex align-items-center">
              <Plus size={20} className="me-2" />
              <h3 className="mb-0">Add Game To Collection</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="row align-items-end">
              <div className="col">
                <Select
                  value={selectedGame}
                  onChange={setSelectedGame}
                  options={games
                    .filter(game => !collection.some(item => item.gameId === game.id))
                    .map(game => ({
                      value: game.id,
                      label: game.title,  // Just use the title as the label
                      sublabel: consoles.find(c => c.id === game.consoleId)?.name || 'Unknown Console',
                      game: game
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label))}
                  isSearchable={true}
                  isClearable={true}
                  placeholder="Search for a game..."
                  className="game-select"
                  classNamePrefix="game-select"
                  formatOptionLabel={option => (
                    <div>
                      {option.label} <span className="text-muted">({option.sublabel})</span>
                    </div>
                  )}
                  filterOption={(option, inputValue) => {
                    if (!inputValue) return true;
                    const searchTerm = inputValue.toLowerCase();
                    return option.label.toLowerCase().includes(searchTerm);
                  }}
                  noOptionsMessage={({ inputValue }) => 
                    inputValue ? "No games found" : "Type to search games"
                  }
                />
              </div>
              <div className="col-auto">
                <button 
                  className="btn btn-primary" 
                  onClick={handleQuickAdd}
                  disabled={!selectedGame || loading}
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <h3>Collection Items ({
                searchQuery || showKinectOnly || showSpecialOnly
                  ? `${filterCollectionItems(collection).length} of ${collection.length} Items` 
                  : `${collection.length} Items`
              })</h3>
            </div>
            <div className="d-flex align-items-center gap-3">
              <button
                className={`btn btn-outline-secondary d-flex align-items-center justify-content-center`}
                onClick={toggleKinectFilter}
                title={showKinectOnly ? "Showing Kinect games only" : "Click to show Kinect games only"}
                style={{ 
                  padding: '4px 12px',
                  height: '31px',
                  opacity: showKinectOnly ? 1 : 0.5
                }}
              >
                <img 
                  src="/logos/kinect.webp" 
                  alt="Kinect"
                  style={{ 
                    height: '16px',
                    filter: 'none'
                  }} 
                />
              </button>
              <button
                className={`btn btn-outline-secondary d-flex align-items-center justify-content-center`}
                onClick={toggleSpecialFilter}
                title={showSpecialOnly ? "Showing Special Editions only" : "Click to show Special Editions only"}
                style={{ 
                  padding: '4px 12px',
                  height: '31px',
                  opacity: showSpecialOnly ? 1 : 0.5
                }}
              >
                <img 
                  src="/logos/specials.webp" 
                  alt="Special Edition"
                  style={{ 
                    height: '16px',
                    filter: 'none'
                  }} 
                />
              </button>
              <Select
                value={{ value: itemsPerPage, label: `${itemsPerPage} items` }}
                onChange={async (option) => {
                  const value = Number(option.value);
                  setItemsPerPage(value);
                  setCurrentPage(1);
                  try {
                    await saveSetting('collectionPageSize', value.toString());
                  } catch (error) {
                    console.error('Error saving page size setting:', error);
                  }
                }}
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
                  })
                }}
              />
              <div className="btn-group">
                <button 
                  className={`btn btn-outline-secondary ${viewType === 'card' ? 'active' : ''}`}
                  onClick={() => handleViewChange('card')}
                >
                  <Grid size={16} />
                </button>
                <button 
                  className={`btn btn-outline-secondary ${viewType === 'table' ? 'active' : ''}`}
                  onClick={() => handleViewChange('table')}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search collection..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {renderCollectionItems()}
          </div>
        </div>

        {modalData.isOpen && (
          <CollectionItemModal
            isOpen={modalData.isOpen}
            onClose={() => setModalData({ isOpen: false, game: null, existingItem: null, isAdd: false })}
            onSave={handleModalSave}
            game={modalData.game}
            existingItem={modalData.existingItem}
            isAdd={modalData.isAdd}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard; 