import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-wrapper">
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <div className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
        <Sidebar />
      </div>
      <div className="main-wrapper">
        <Header onMenuClick={toggleSidebar} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 