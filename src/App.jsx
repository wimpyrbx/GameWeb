// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Games from './pages/games/Games';
import ConsoleAdmin from './pages/consoles/ConsoleAdmin';
import RegionAdmin from './pages/regions/RegionAdmin';
import DatabaseViewer from './pages/database/DatabaseViewer';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/games" element={<Games />} />
          <Route path="/consoles" element={<ConsoleAdmin />} />
          <Route path="/regions" element={<RegionAdmin />} />
          <Route path="/database" element={<DatabaseViewer />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;