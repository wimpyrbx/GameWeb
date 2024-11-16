import React, { useState, useEffect } from 'react';
import { openDB } from 'idb';

const DatabaseViewer = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [schema, setSchema] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const db = await openDB('gameCollectionDB');
      setTables(Array.from(db.objectStoreNames));
      if (db.objectStoreNames.length > 0) {
        setSelectedTable(db.objectStoreNames[0]);
      }
    } catch (error) {
      setError('Failed to load tables: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTableSchema = async (tableName) => {
    try {
      const db = await openDB('gameCollectionDB');
      const tx = db.transaction(tableName, 'readonly');
      const store = tx.objectStore(tableName);
      
      const schema = {
        name: tableName,
        keyPath: store.keyPath,
        autoIncrement: store.autoIncrement,
        indexes: []
      };

      // Get indexes
      for (const indexName of store.indexNames) {
        const index = store.index(indexName);
        schema.indexes.push({
          name: indexName,
          keyPath: index.keyPath,
          multiEntry: index.multiEntry,
          unique: index.unique
        });
      }

      setSchema(schema);
    } catch (error) {
      setError('Failed to load schema: ' + error.message);
    }
  };

  const loadTableData = async (tableName) => {
    try {
      setLoading(true);
      const db = await openDB('gameCollectionDB');
      let allData = await db.getAll(tableName);
      
      // Only show latest 100 entries
      allData = allData.slice(-100);
      setData(allData);
    } catch (error) {
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = async (e) => {
    const tableName = e.target.value;
    setSelectedTable(tableName);
    await loadTableSchema(tableName);
    await loadTableData(tableName);
  };

  useEffect(() => {
    if (selectedTable) {
      loadTableSchema(selectedTable);
      loadTableData(selectedTable);
    }
  }, [selectedTable]);

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h2>Database Viewer</h2>
        <p className="text-muted">View database tables and their contents</p>
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
        <div className="card mb-4">
          <div className="card-header">
            <h3>Select Table</h3>
          </div>
          <div className="card-body">
            <select 
              className="form-control"
              value={selectedTable}
              onChange={handleTableChange}
              disabled={loading}
            >
              {tables.map(table => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>
        </div>

        {schema && (
          <div className="card mb-4">
            <div className="card-header">
              <h3>Table Schema: {schema.name}</h3>
            </div>
            <div className="card-body">
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <th>Key Path:</th>
                    <td>{schema.keyPath}</td>
                  </tr>
                  <tr>
                    <th>Auto Increment:</th>
                    <td>{schema.autoIncrement ? 'Yes' : 'No'}</td>
                  </tr>
                </tbody>
              </table>

              <h4 className="mt-4">Indexes</h4>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Key Path</th>
                    <th>Multi Entry</th>
                    <th>Unique</th>
                  </tr>
                </thead>
                <tbody>
                  {schema.indexes.map(index => (
                    <tr key={index.name}>
                      <td>{index.name}</td>
                      <td>{Array.isArray(index.keyPath) ? index.keyPath.join(', ') : index.keyPath}</td>
                      <td>{index.multiEntry ? 'Yes' : 'No'}</td>
                      <td>{index.unique ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data.length > 0 && (
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3>Table Data</h3>
              <span className="badge badge-info">
                Showing {data.length} {data.length === 100 ? '(Limited)' : ''} entries
              </span>
            </div>
            <div className="card-body">
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
                          <td key={i}>
                            {typeof value === 'object' ? 
                              JSON.stringify(value) : 
                              String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseViewer; 