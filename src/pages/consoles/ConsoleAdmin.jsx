import React, { useState, useEffect } from 'react';
import { consoleDB, gamesDB } from '../../services/db';
import { Trash2 } from 'lucide-react';

const ConsoleAdmin = () => {
  const [consoles, setConsoles] = useState([]);
  const [newConsole, setNewConsole] = useState({ name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [gamesCount, setGamesCount] = useState({});

  useEffect(() => {
    loadConsoles();
  }, []);

  const loadConsoles = async () => {
    try {
      setLoading(true);
      const allConsoles = await consoleDB.getAllConsoles();
      const allGames = await gamesDB.getAllGames();
      
      // Count games for each console
      const counts = allGames.reduce((acc, game) => {
        acc[game.consoleId] = (acc[game.consoleId] || 0) + 1;
        return acc;
      }, {});
      
      // Sort consoles alphabetically by name
      const sortedConsoles = allConsoles.sort((a, b) => 
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
      
      setGamesCount(counts);
      setConsoles(sortedConsoles);
    } catch (error) {
      setError('Failed to load consoles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddConsole = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate console name
    const consoleName = newConsole.name.trim();
    if (!consoleName) {
      setError('Console name cannot be empty');
      return;
    }

    // Check if console name already exists (case-insensitive)
    const exists = consoles.some(c => 
      c.name.toLowerCase() === consoleName.toLowerCase()
    );
    if (exists) {
      setError('A console with this name already exists');
      return;
    }

    try {
      setLoading(true);
      await consoleDB.addConsole({ name: consoleName });
      setNewConsole({ name: '' });
      setSuccess(`Console "${consoleName}" added successfully`);
      await loadConsoles(); // Reload the consoles list
    } catch (error) {
      setError('Error adding console: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConsole = async (id, name) => {
    // First check if there are any games for this console
    if (gamesCount[id] > 0) {
      setError(`Cannot delete "${name}" because it has ${gamesCount[id]} games in the database. Remove all games for this console first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await consoleDB.deleteConsole(id);
      setSuccess(`Console "${name}" deleted successfully`);
      await loadConsoles(); // Reload the consoles list
    } catch (error) {
      setError('Error deleting console: ' + error.message);
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
                <h3>Add New Console</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleAddConsole}>
                  <div className="form-group">
                    <label htmlFor="consoleName">Console Name</label>
                    <input
                      id="consoleName"
                      type="text"
                      className="form-control"
                      placeholder="Enter console name (e.g., PlayStation 5)"
                      value={newConsole.name}
                      onChange={(e) => setNewConsole({ name: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="mt-3">
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100"
                      disabled={loading || !newConsole.name.trim()}
                    >
                      {loading ? 'Adding...' : 'Add Console'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3>Console List</h3>
                <span className="badge badge-info">{consoles.length} Consoles</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
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
                      {consoles.map(console => (
                        <tr key={console.id}>
                          <td>{console.id}</td>
                          <td>{console.name}</td>
                          <td>
                            <span className={`badge ${gamesCount[console.id] ? 'badge-warning' : 'badge-success'}`}>
                              {gamesCount[console.id] || 0} games
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Trash2 
                              size={18}
                              className={`text-danger ${gamesCount[console.id] > 0 ? 'opacity-50' : 'cursor-pointer'}`}
                              onClick={() => !gamesCount[console.id] && handleDeleteConsole(console.id, console.name)}
                              style={{ 
                                cursor: gamesCount[console.id] > 0 ? 'not-allowed' : 'pointer'
                              }}
                              title={gamesCount[console.id] > 0 ? 
                                `Cannot delete - ${gamesCount[console.id]} games exist for this console` : 
                                'Delete console'}
                            />
                          </td>
                        </tr>
                      ))}
                      {consoles.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center">
                            {loading ? 'Loading consoles...' : 'No consoles found'}
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
    </div>
  );
};

export default ConsoleAdmin; 