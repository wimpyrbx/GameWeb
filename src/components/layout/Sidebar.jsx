import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Database, Gamepad2, Globe, Trash2 } from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Collection' },
    { path: '/games', icon: Database, label: 'Games Database' },
    { path: '/consoles', icon: Gamepad2, label: 'Console Admin' },
    { path: '/regions', icon: Globe, label: 'Region Admin' },
    { path: '/database', icon: Database, label: 'Database Viewer' }
  ];

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
        <button 
          className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
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