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

  useEffect(() => {
    const loadViewType = async () => {
      const savedViewType = await getSetting('collectionViewType') || 'card';
      setViewType(savedViewType);
      loadData();
    };
    loadViewType();
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
    await saveSetting('collectionViewType', type); // Save the selected view type
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
        await collectionDB.addCollectionItem({
          ...formData,
          gameId: modalData.game.id,
          consoleId: modalData.game.consoleId,
          regionId: modalData.game.regionId,
          addedDate: new Date().toISOString()
        });
      } else {
        await collectionDB.updateCollectionItem(modalData.existingItem.id, {
          ...formData,
          gameId: modalData.game.id,
          consoleId: modalData.game.consoleId,
          regionId: modalData.game.regionId
        });
      }
      setModalData({ isOpen: false, game: null, existingItem: null, isAdd: false });
      setSelectedGame(null); // Clear selected game after adding
      loadData(); // Reload the collection
      setSuccess(`Successfully ${modalData.isAdd ? 'added' : 'updated'} game in collection`);
    } catch (error) {
      setError(`Failed to ${modalData.isAdd ? 'add' : 'update'} collection item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filterCollectionItems = (items) => {
    if (!searchQuery) return items;
    
    return items.filter(item => {
      const game = games.find(g => g.id === item.gameId);
      const console = consoles.find(c => c.id === item.consoleId);
      const searchString = `${game?.title || ''} ${console?.name || ''}`.toLowerCase();
      return searchString.includes(searchQuery.toLowerCase());
    });
  };

  const renderCollectionItems = () => {
    const filteredItems = filterCollectionItems(collection);
    
    if (viewType === 'card') {
      return (
        <div className="collection-cards-grid">
          {filteredItems.map(item => {
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
      );
    }

    return (
      <Table 
        data={filteredItems}
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
                  {loading ? 'Adding...' : 'Quick Add'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Database size={20} className="pe-2" />
                <h3 className="mb-0">Collection Items ({collection.length} Item{collection.length !== 1 ? 's' : ''})</h3>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="search-box">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search collection..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <button 
                    className={`btn ${viewType === 'card' ? 'btn-primary' : 'btn-outline-secondary'} me-2`}
                    onClick={() => handleViewChange('card')}
                  >
                    <Grid size={16} className="me-2" style={{ position: 'relative', top: '-1px' }} /> Card View
                  </button>
                  <button 
                    className={`btn ${viewType === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => handleViewChange('table')}
                  >
                    <List size={16} className="me-2" style={{ position: 'relative', top: '-1px' }} /> Table View
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="card-body">
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