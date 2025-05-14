import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import Navigation from '../../components/layout/Navigation/Navigation';

const AdminPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAdminAccess = () => {
      const userData = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (!userData || userData.role !== 'Admin') {
        navigate('/');
      }
    };
    checkAdminAccess();
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-page-wrapper">
      <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} />
      
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={toggleSidebar}
        />
      )}

      <div className={`admin-page-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPage;