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
  Database
} from 'lucide-react'; // Import icons for view switching

const Dashboard = () => {
  const [collection, setCollection] = useState([]);
  const [games, setGames] = useState([]);
  const [consoles, setConsoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewType, setViewType] = useState('card'); // State to manage view type

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

      // Fetch CIB prices for all games in the collection
      const pricesPromises = collectionItems.map(item => 
        pricesDB.getLatestPrice(item.gameDetails.pricechartingId)
      );
      const prices = await Promise.all(pricesPromises);

      // Map prices back to collection items
      const updatedCollection = collectionItems.map((item, index) => ({
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

  const handleAddToCollection = async (e) => {
    e.preventDefault();
    // Your logic for adding a game to the collection
    // Ensure you have the necessary state and form handling here
  };

  const handleViewChange = async (type) => {
    setViewType(type);
    await saveSetting('collectionViewType', type); // Save the selected view type
  };

  const renderCollectionItems = () => {
    if (viewType === 'card') {
      return (
        <div className="collection-cards-grid">
          {collection.map(item => (
            <CollectionCard
              key={item.id}
              item={item}
              onDelete={handleDeleteCollectionItem}
              loading={loading}
            />
          ))}
        </div>
      );
    }

    return (
      <Table 
        data={collection}
        columns={[
          { header: 'Game', key: 'title' },
          { header: 'Console', key: 'console', render: (game) => consoles.find(c => c.id === game.consoleId)?.name },
          { header: 'Added On', key: 'addedDate', render: (game) => new Date(game.addedDate).toLocaleDateString() },
          { header: 'CIB Price', key: 'cibPrice', render: (game) => game.cibPrice !== null ? `$${game.cibPrice}` : 'N/A' },
          { header: 'Final Price', key: 'finalPrice', render: (game) => game.price_override || game.cibPrice || 'N/A' },
          { header: 'Actions', key: 'actions', render: (game) => (
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDeleteCollectionItem(game.id)}
              disabled={loading}
            >
              Delete
            </button>
          )}
        ]}
      />
    );
  };

  return (
    <div className="content-wrapper">
      <Sidebar />
      <div className="content-header">
        <div className="d-flex align-items-center">
          <Library size={24} className="me-3" style={{ position: 'relative', top: '-1px' }} />
          <div>
            <h2>My Game Collection</h2>
            <p className="text-muted">Manage your personal game collection</p>
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

      <div className="content-body">
        <div className="d-flex justify-content-end mb-3">
          <button 
            className="btn btn-outline-secondary me-2"
            onClick={() => handleViewChange('card')}
          >
            <Grid size={16} className="me-2" style={{ position: 'relative', top: '-1px' }} /> Card View
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => handleViewChange('table')}
          >
            <List size={16} className="me-2" style={{ position: 'relative', top: '-1px' }} /> Table View
          </button>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <div className="d-flex align-items-center">
              <Plus size={20} className="me-3" style={{ position: 'relative', top: '-1px' }} />
              <h3 className="mb-0">Add Game to Collection</h3>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddToCollection} className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="gameId">Select Game</label>
                  <select 
                    id="gameId"
                    name="gameId" 
                    className="form-control" 
                    required
                  >
                    <option value="">Select Game</option>
                    {games.map(game => (
                      <option key={game.id} value={game.id}>
                        {game.title} ({consoles.find(c => c.id === game.consoleId)?.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="bmdCondition">BMD</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <Select 
                      id="boxCondition" 
                      name="boxCondition" 
                      options={[1, 2, 3, 4, 5].map(value => ({
                        value,
                        label: value,
                        color: value === 1 ? 'red' : value === 5 ? 'green' : '#d4edda'
                      }))}
                      onChange={(option) => handleConditionChange(item, 'boxCondition', option.value)}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          width: '60px',
                          backgroundColor: '#d4edda',
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected ? '#d4edda' : state.isFocused ? '#f0f0f0' : '#fff',
                          color: state.data.color,
                        }),
                      }}
                      defaultValue={{ value: 3, label: '3', color: '#d4edda' }}
                    />
                    <Select 
                      id="manualCondition" 
                      name="manualCondition" 
                      options={[1, 2, 3, 4, 5].map(value => ({
                        value,
                        label: value,
                        color: value === 1 ? 'red' : value === 5 ? 'green' : '#d4edda'
                      }))}
                      onChange={(option) => handleConditionChange(item, 'manualCondition', option.value)}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          width: '60px',
                          backgroundColor: '#d4edda',
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected ? '#d4edda' : state.isFocused ? '#f0f0f0' : '#fff',
                          color: state.data.color,
                        }),
                      }}
                      defaultValue={{ value: 3, label: '3', color: '#d4edda' }}
                    />
                    <Select 
                      id="discCondition" 
                      name="discCondition" 
                      options={[1, 2, 3, 4, 5].map(value => ({
                        value,
                        label: value,
                        color: value === 1 ? 'red' : value === 5 ? 'green' : '#d4edda'
                      }))}
                      onChange={(option) => handleConditionChange(item, 'discCondition', option.value)}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          width: '60px',
                          backgroundColor: '#d4edda',
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected ? '#d4edda' : state.isFocused ? '#f0f0f0' : '#fff',
                          color: state.data.color,
                        }),
                      }}
                      defaultValue={{ value: 3, label: '3', color: '#d4edda' }}
                    />
                  </div>
                </div>
              </div>
              <div className="col-12">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add to Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Database size={20} className="me-3" style={{ position: 'relative', top: '-1px' }} />
              <h3 className="mb-0">Collection Items</h3>
            </div>
            <span className="badge badge-info">{collection.length} Items</span>
          </div>
          <div className="card-body">
            {renderCollectionItems()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 