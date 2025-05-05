// src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import website_logo_transparent from '../../Assets/website-logo-transparent.png';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className='sidebar'>
      <div className="sidebar-logo">
        <img src={website_logo_transparent} alt="Logo" />
      </div>
      <div className="sidebar-links">
        <button className="nav-item" onClick={() => navigate('/dashboard')}>Dashboard</button>
        <button className="nav-item" onClick={() => navigate('/study-plans')}>Study Plans</button>
        <button className="nav-item" onClick={() => navigate('/notes')}>Notes</button>
        <button className="nav-item" onClick={() => navigate('/settings')}>⚙️ Settings</button>
      </div>
      <button className="sidebar-logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Sidebar;
