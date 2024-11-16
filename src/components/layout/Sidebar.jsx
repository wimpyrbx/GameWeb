import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Database, Gamepad2, Settings, Globe, Trash2 } from 'lucide-react';
import { deleteDB } from 'idb';

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
    if (window.confirm('Are you sure you want to clear the database? This action cannot be undone.')) {
      try {
        await deleteDB('gameCollectionDB');
        window.location.reload(); // Reload the page to reinitialize the database
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
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={handleClick}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="sidebar-footer" style={{ 
        padding: '20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        marginTop: 'auto'
      }}>
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