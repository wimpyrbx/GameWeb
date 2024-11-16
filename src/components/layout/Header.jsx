import React from 'react';
import { Users as IconUsers, Menu } from 'lucide-react';

const Header = ({ onMenuClick, isMobile }) => (
  <header className="header">
    <div className="header-left">
      {isMobile && (
        <button className="btn btn-link" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
      )}
    </div>
    <div className="header-right">
      <button className="btn btn-link">
        <IconUsers size={20} />
      </button>
    </div>
  </header>
);

export default Header; 