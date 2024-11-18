import React, { useState, useEffect } from 'react';
import { Database, Table as TableIcon } from 'lucide-react';
import './DatabaseViewer.css';

const truncateText = (text, maxLength = 30) => {
  if (text === null || text === undefined) return '';
  return text.toString().length > maxLength ? text.toString().substring(0, maxLength) + '...' : text.toString();
};

const calculateFontSize = (columnCount) => {
  const baseSize = 14;
  const reduction = Math.max(0, columnCount - 10) * 0.5;
  return Math.max(11, baseSize - reduction);
};

const DatabaseViewer = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [tables, setTables] = useState([]);
  const [data, setData] = useState([]);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available tables when component mounts
  useEffect(() => {
    fetch('http://localhost:3001/api/tables')
      .then(res => res.json())
      .then(data => {
        setTables(data);
        if (data.length > 0) {
          setSelectedTable(data[0]);
        }
      })
      .catch(err => {
        console.error('Error fetching tables:', err);
        setError('Failed to fetch tables: ' + err.message);
      });
  }, []);

  const loadTableData = async (tableName) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/${tableName}`);
      if (!response.ok) throw new Error('Failed to fetch table data');
      const data = await response.json();
      
      // Commented out the console.log for API response
      // console.log('API Response:', data);

      let tableData;
      if (Array.isArray(data)) {
        tableData = data;
      } else if (data.rows && Array.isArray(data.rows)) {
        tableData = data.rows;
      } else if (typeof data === 'object' && Object.values(data).some(Array.isArray)) {
        tableData = Object.values(data).flat();
      } else {
        throw new Error('Unexpected data format received');
      }

      setData(tableData.slice(0, 50));
    } catch (error) {
      console.error('Error loading table data:', error);
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

  useEffect(() => {
    if (selectedTable) {
      fetch(`http://localhost:3001/api/schema/${selectedTable}`)
        .then(res => res.json())
        .then(data => {
          setSchema(data);
        })
        .catch(err => {
          console.error('Error fetching schema:', err);
          setError('Failed to fetch schema: ' + err.message);
        });
    }
  }, [selectedTable]);

  // Add this helper function inside the component
  const getColumnHeaders = (data) => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  return (
    <div className="content-wrapper">
      <div className="content-body">
        {error && <div className="alert alert-danger">{error}</div>}
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
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Not Null</th>
                        <th>Default Value</th>
                        <th>Primary Key</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schema.map((column, index) => (
                        <tr key={column.cid}>
                          <td>{index + 1}</td>
                          <td>{column.name}</td>
                          <td>{column.type}</td>
                          <td>{column.notnull ? 'Yes' : 'No'}</td>
                          <td>{column.dflt_value || 'None'}</td>
                          <td>{column.pk ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                      <div className="table-wrapper">
                        <table className="table table-bordered table-hover">
                          <thead>
                            <tr style={{ fontSize: calculateFontSize(getColumnHeaders(data).length) }}>
                              {getColumnHeaders(data).map((header, index) => (
                                <th key={index}>
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {data.map((row, rowIndex) => (
                              <tr 
                                key={rowIndex}
                                style={{ fontSize: calculateFontSize(getColumnHeaders(data).length) }}
                              >
                                {getColumnHeaders(data).map((column, colIndex) => (
                                  <td
                                    key={colIndex}
                                    title={row[column]?.toString() || ''}
                                  >
                                    {truncateText(row[column], 30)}
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