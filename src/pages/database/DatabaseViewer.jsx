import React, { useState, useEffect } from 'react';
import { Database, Table as TableIcon } from 'lucide-react';

const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const DatabaseViewer = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [schema, setSchema] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Table schemas with updated names
  const tableSchemas = {
    gamesdatabase: `CREATE TABLE gamesdatabase (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      consoleId INTEGER,
      regionId INTEGER,
      rating TEXT,
      pricechartingId TEXT,
      pricechartingUrl TEXT,
      coverUrl TEXT,
      developer TEXT,
      publisher TEXT,
      releaseDate TEXT,
      genre TEXT
    )`,
    consoles: `CREATE TABLE consoles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`,
    regions: `CREATE TABLE regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`,
    prices: `CREATE TABLE prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pricechartingId TEXT,
      loose REAL,
      cib REAL,
      new REAL,
      box REAL,
      manual REAL,
      date TEXT
    )`,
    collection: `CREATE TABLE collection (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gameId INTEGER,
      consoleId INTEGER,
      regionId INTEGER,
      addedDate TEXT,
      boxCondition TEXT,
      discCondition TEXT,
      manualCondition TEXT,
      price_override REAL
    )`,
    settings: `CREATE TABLE settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`
  };

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      setTables(Object.keys(tableSchemas));
      if (Object.keys(tableSchemas).length > 0) {
        setSelectedTable(Object.keys(tableSchemas)[0]);
      }
    } catch (error) {
      setError('Failed to load tables: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (tableName) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/${tableName}`);
      if (!response.ok) throw new Error('Failed to fetch table data');
      const data = await response.json();
      setData(data.slice(0, 50)); // Get last 50 entries
      setSchema(tableSchemas[tableName]);
    } catch (error) {
      setError('Failed to load table data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  }, [selectedTable]);

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

      <div className="content-body">
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card h-100">
              <div className="card-header">
                <h3 className="card-title">Tables</h3>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {tables.map(table => (
                    <button
                      key={table}
                      className={`list-group-item list-group-item-action d-flex align-items-center ${selectedTable === table ? 'active' : ''}`}
                      onClick={() => setSelectedTable(table)}
                    >
                      <TableIcon size={16} className="me-3" />
                      {table}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            {selectedTable && (
              <div className="card h-100">
                <div className="card-header">
                  <h3 className="card-title">Table Schema: {selectedTable}</h3>
                </div>
                <div className="card-body">
                  <div className="schema-container">
                    <pre className="bg-light">
                      <code>{schema}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedTable && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3 className="card-title">Table Data: {selectedTable}</h3>
                  <span className="badge bg-info text-white">
                    Showing {data.length} entries
                  </span>
                </div>
                <div className="card-body table-card-body">
                  <div className="table-container">
                    {loading ? (
                      <div className="text-center p-4">Loading...</div>
                    ) : data.length === 0 ? (
                      <div className="text-center p-4">No data available</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              {Object.keys(data[0]).map(key => (
                                <th key={key}>{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {data.map((row, index) => (
                              <tr key={index}>
                                {Object.values(row).map((value, i) => (
                                  <td key={i} title={typeof value === 'object' ? JSON.stringify(value) : String(value)}>
                                    {typeof value === 'object' 
                                      ? truncateText(JSON.stringify(value))
                                      : truncateText(String(value))
                                    }
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseViewer; 