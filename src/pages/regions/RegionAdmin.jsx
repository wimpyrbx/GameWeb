import React, { useState, useEffect } from 'react';
import { regionDB, gamesDB } from '../../services/db';
import { Trash2 } from 'lucide-react';

const RegionAdmin = () => {
  const [regions, setRegions] = useState([]);
  const [newRegion, setNewRegion] = useState({ name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [gamesCount, setGamesCount] = useState({});

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoading(true);
      const allRegions = await regionDB.getAllRegions();
      const allGames = await gamesDB.getAllGames();
      
      // Count games for each region
      const counts = allGames.reduce((acc, game) => {
        acc[game.regionId] = (acc[game.regionId] || 0) + 1;
        return acc;
      }, {});
      
      // Sort regions alphabetically by name
      const sortedRegions = allRegions.sort((a, b) => 
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
      
      setGamesCount(counts);
      setRegions(sortedRegions);
    } catch (error) {
      setError('Failed to load regions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRegion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate region name
    const regionName = newRegion.name.trim();
    if (!regionName) {
      setError('Region name cannot be empty');
      return;
    }

    // Check if region name already exists (case-insensitive)
    const exists = regions.some(r => 
      r.name.toLowerCase() === regionName.toLowerCase()
    );
    if (exists) {
      setError('A region with this name already exists');
      return;
    }

    try {
      setLoading(true);
      await regionDB.addRegion({ name: regionName });
      setNewRegion({ name: '' });
      setSuccess(`Region "${regionName}" added successfully`);
      loadRegions();
    } catch (error) {
      setError('Error adding region: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegion = async (id, name) => {
    // First check if there are any games for this region
    if (gamesCount[id] > 0) {
      setError(`Cannot delete "${name}" because it has ${gamesCount[id]} games in the database. Remove all games for this region first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      setLoading(true);
      await regionDB.deleteRegion(id);
      setSuccess(`Region "${name}" deleted successfully`);
      loadRegions();
    } catch (error) {
      console.error('Delete error:', error);
      setError('Error deleting region: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
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
        <div className="row">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h3>Add New Region</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleAddRegion}>
                  <div className="form-group">
                    <label htmlFor="regionName">Region Name</label>
                    <input
                      id="regionName"
                      type="text"
                      className="form-control"
                      placeholder="Enter region name (e.g., NTSC-U, PAL)"
                      value={newRegion.name}
                      onChange={(e) => setNewRegion({ name: e.target.value })}
                      required
                      disabled={loading}
                    />
                    <small className="form-text text-muted">
                      Region names must be unique and cannot be empty
                    </small>
                  </div>
                  <div className="mt-3">
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100"
                      disabled={loading || !newRegion.name.trim()}
                    >
                      {loading ? 'Adding...' : 'Add Region'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3>Region List</h3>
                <span className="badge badge-info">{regions.length} Regions</span>
              </div>
              <div className="card-body p-0">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Games Count</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.map(region => (
                      <tr key={region.id}>
                        <td>{region.id}</td>
                        <td>{region.name}</td>
                        <td>
                          <span className={`badge ${gamesCount[region.id] ? 'badge-warning' : 'badge-success'}`}>
                            {gamesCount[region.id] || 0} games
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Trash2 
                            size={18}
                            className={`text-danger ${gamesCount[region.id] > 0 ? 'opacity-50' : 'cursor-pointer'}`}
                            onClick={() => !gamesCount[region.id] && handleDeleteRegion(region.id, region.name)}
                            style={{ 
                              cursor: gamesCount[region.id] > 0 ? 'not-allowed' : 'pointer'
                            }}
                            title={gamesCount[region.id] > 0 ? 
                              `Cannot delete - ${gamesCount[region.id]} games exist for this region` : 
                              'Delete region'}
                          />
                        </td>
                      </tr>
                    ))}
                    {regions.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center">
                          {loading ? 'Loading regions...' : 'No regions found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionAdmin; 