import React, { useState, useEffect } from 'react';
import { regionDB, gamesDB } from '../../services/db';

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
      <div className="content-header">
        <h2>Region Management</h2>
        <p className="text-muted">Manage your region list</p>
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

      <div className="content-body">
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>Add New Region</h3>
            <small className="text-muted">Add a new region format to the database</small>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddRegion} className="row g-3">
              <div className="col-md-10">
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
              </div>
              <div className="col-md-2">
                <label>&nbsp;</label>
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

        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>Region List</h3>
            <span className="badge badge-info">{regions.length} Regions</span>
          </div>
          <div className="card-body">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Games Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {regions.map(region => (
                  <tr key={region.id}>
                    <td>{region.name}</td>
                    <td>
                      <span className={`badge ${gamesCount[region.id] ? 'badge-warning' : 'badge-success'}`}>
                        {gamesCount[region.id] || 0} games
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteRegion(region.id, region.name)}
                        disabled={loading || gamesCount[region.id] > 0}
                        title={gamesCount[region.id] > 0 ? 
                          `Cannot delete - ${gamesCount[region.id]} games exist for this region` : 
                          'Delete region'}
                      >
                        {loading ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
                {regions.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center">
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
  );
};

export default RegionAdmin; 