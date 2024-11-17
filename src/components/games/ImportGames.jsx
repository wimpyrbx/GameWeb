import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { parseGamesList } from '../../utils/importHelpers';

const ImportGames = ({ onImportComplete }) => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/tab-separated-values': ['.tsv'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setImporting(true);
    setError('');
    setSuccess('');

    try {
      const text = await selectedFile.text();
      const games = await parseGamesList(text);
      
      let failedImports = [];
      
      for (const game of games) {
        try {
          const response = await fetch('http://localhost:3001/api/gamesdatabase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(game)
          });
          
          if (!response.ok) {
            throw new Error(`Failed to add game`);
          }
        } catch (error) {
          failedImports.push(`Failed to import "${game.title}": ${error.message}`);
        }
      }

      if (failedImports.length > 0) {
        setError(`Failed to import ${failedImports.length} games:\n${failedImports.join('\n')}`);
      } else {
        setSuccess(`Successfully imported ${games.length} games`);
        setSelectedFile(null);
        if (onImportComplete) {
          onImportComplete();
        }
      }
    } catch (error) {
      setError('Error parsing file: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Import Games</h3>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <AlertCircle size={20} className="me-2" />
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <CheckCircle size={20} className="me-2" />
            {success}
          </div>
        )}

        <div 
          {...getRootProps()} 
          className={`dropzone-area ${isDragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
          style={{
            border: '2px dashed #ccc',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? '#f8f9fa' : 'white',
            transition: 'all 0.3s ease'
          }}
        >
          <input {...getInputProps()} />
          
          <div className="d-flex flex-column align-items-center">
            {isDragActive ? (
              <p className="mb-0">Drop the file here...</p>
            ) : selectedFile ? (
              <div className="selected-file">
                <FileText size={24} className="me-2" />
                <span>{selectedFile.name}</span>
              </div>
            ) : (
              <div>
                <Upload 
                  size={48}
                  style={{ 
                    color: isDragActive ? '#0d6efd' : '#6c757d',
                    transition: 'color 0.3s ease'
                  }} 
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 text-center">
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={importing || !selectedFile}
          >
            {importing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Importing...
              </>
            ) : (
              <>Import Games</>
            )}
          </button>
        </div>
      </div>

      <style>
        {`
          .dropzone-area {
            outline: none;
          }
          .dropzone-area.active {
            border-color: #0d6efd;
          }
          .dropzone-area.has-file {
            border-color: #198754;
          }
          .selected-file {
            display: flex;
            align-items: center;
            color: #198754;
          }
          .alert pre {
            font-family: inherit;
          }
        `}
      </style>
    </div>
  );
};

export default ImportGames; 