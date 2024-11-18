import React from 'react';
import { Users as IconUsers, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = ({ onMenuClick, isMobile }) => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Collection';
      case '/games':
        return 'Games Database';
      case '/consoles':
        return 'Console Admin';
      case '/regions':
        return 'Region Admin';
      case '/database':
        return 'Database Viewer';
      case '/database/sql':
        return 'Manual SQL';
      default:
        return '';
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        {isMobile && (
          <button className="btn btn-link" onClick={onMenuClick}>
            <Menu size={24} />
          </button>
        )}
        <h2 className="page-title">{getPageTitle()}</h2>
      </div>
      <div className="header-right">
        <button className="btn btn-link">
          <IconUsers size={20} />
        </button>
      </div>

      <style>
        {`
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 2rem;
            background: #fff;
            border-bottom: 1px solid #e5e9f2;
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .page-title {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 500;
            color: #1e2531;
          }
        `}
      </style>
    </header>
  );
};

export default Header; 