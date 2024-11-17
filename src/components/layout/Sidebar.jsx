import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Database, Gamepad2, Globe, Trash2, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const [exchangeRate, setExchangeRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Collection' },
    { path: '/games', icon: Database, label: 'Games Database' },
    { path: '/consoles', icon: Gamepad2, label: 'Console Admin' },
    { path: '/regions', icon: Globe, label: 'Region Admin' },
    { path: '/database', icon: Database, label: 'Database Viewer' }
  ];

  useEffect(() => {
    loadExchangeRate();
  }, []);

  const loadExchangeRate = async () => {
    try {
      const { rate, last_updated } = await api.getExchangeRate('NOK');
      setExchangeRate(rate);
      setLastUpdated(last_updated ? new Date(last_updated) : null);
    } catch (error) {
      console.error('Failed to load exchange rate:', error);
    }
  };

  const handleRefreshRate = async () => {
    if (updating) return;
    try {
      setUpdating(true);
      await api.refreshExchangeRate('NOK');
      await loadExchangeRate();
    } catch (error) {
      console.error('Failed to refresh exchange rate:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatLastUpdated = (lastUpdated) => {
    if (!lastUpdated) return 'No update available';
    try {
      const date = new Date(lastUpdated);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleClick = () => {
    if (onClose) onClose();
  };

  const handleClearDatabase = async () => {
    if (window.confirm('Are you sure you want to clear all database tables? This action cannot be undone.')) {
      try {
        const response = await fetch('http://localhost:3001/api/clear-database', {
          method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to clear database');
        window.location.reload();
      } catch (error) {
        console.error('Error clearing database:', error);
        alert('Failed to clear database: ' + error.message);
      }
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="brand">GameWeb Admin</h1>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={handleClick}
              >
                <Icon 
                  size={18} 
                  className={`me-2 ${isActive ? 'icon-active' : ''}`}
                  style={{ marginRight: '12px' }}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="exchange-rate-info">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span>USD/NOK Rate:</span>
            <button 
              className="btn btn-link btn-sm p-0" 
              onClick={handleRefreshRate}
              disabled={updating}
            >
              <RefreshCw size={14} className={updating ? 'spin' : ''} />
            </button>
          </div>
          <div className="rate-value">{exchangeRate ? exchangeRate.toFixed(2) : '-'}</div>
          <div className="last-updated text-muted">
            Updated: {formatLastUpdated(lastUpdated)}
          </div>
        </div>
        <button 
          className="btn btn-danger w-100 d-flex align-items-center justify-content-center mt-3"
          onClick={handleClearDatabase}
        >
          <Trash2 size={16} className="me-2" />
          Clear Database
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 