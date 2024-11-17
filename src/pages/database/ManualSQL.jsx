import React, { useState } from 'react';
import { api } from '../../services/api';

const ManualSQL = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setResults(null);

      console.log('Executing query:', query);

      const response = await api.executeSQL(query);
      console.log('Query response:', response);

      if (response.success) {
        setResults(response.data);
      } else {
        setError(response.message || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Query execution error:', err);
      setError(err.message || 'Failed to execute query');
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;
    if (!Array.isArray(results) || results.length === 0) {
      return <div className="alert alert-info">Query executed successfully. No results to display.</div>;
    }

    const columns = Object.keys(results[0]);

    return (
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>{JSON.stringify(row[column])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <div className="content-body">
        <div className="card">
          <div className="card-header">
            <h3>Manual SQL Query</h3>
          </div>
          <div className="card-body">
            <div className="alert alert-warning">
              <strong>Warning:</strong> Be careful with manual SQL queries. Make sure you know what you're doing.
            </div>
            <div className="form-group mb-3">
              <textarea
                className="form-control font-monospace"
                style={{ 
                  minHeight: '200px',
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  padding: '1rem',
                  fontSize: '14px'
                }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your SQL query here..."
                spellCheck="false"
              />
            </div>
            <div className="d-flex justify-content-end mb-4">
              <button
                className="btn btn-primary"
                onClick={handleExecute}
                disabled={loading || !query.trim()}
              >
                {loading ? 'Executing...' : 'Execute Query'}
              </button>
            </div>

            {error && (
              <div className="alert alert-danger">
                <strong>Error:</strong> {error}
                <pre className="mt-2 mb-0 text-danger">
                  {query}
                </pre>
              </div>
            )}

            {results && (
              <div className="results-section">
                <h4 className="mb-3">Query Results</h4>
                <div className="alert alert-success mb-3">
                  Query executed successfully
                  <pre className="mt-2 mb-0">
                    {query}
                  </pre>
                </div>
                {renderResults()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualSQL; 