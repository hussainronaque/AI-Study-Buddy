// SidebarLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import './SidebarLayout.css';

const SidebarLayout = () => {
  return (
    <main className="layout">
      <Sidebar />
      <div className="content">
        <Outlet />
      </div>
    </main>
  );
};

export default SidebarLayout;

