import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import Navigation from '../../components/layout/Navigation/Navigation';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import UserDashboard from '../../components/layout/UserDashboard/UserDashboard';
import { jwtDecode } from 'jwt-decode';
import './MainPage.css';

const MainPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Функция для проверки авторизации
  const checkAuth = () => {
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
      try {
        const decoded = jwtDecode(token);
        const user = JSON.parse(userData);
        
        if (decoded.nameid === user.id && decoded.exp * 1000 > Date.now()) {
          return user;
        }
      } catch (err) {
        console.error('Invalid token or user data:', err);
      }
    }
    return null;
  };

  useEffect(() => {
    setIsCheckingAuth(true);
    const user = checkAuth();
    
    if (user) {
      setCurrentUser(user);
      setSidebarOpen(true); // Убедимся, что сайдбар открыт
    } else {
      handleLogout();
    }
    
    setIsCheckingAuth(false);
    
    const handleStorageChange = () => {
      const user = checkAuth();
      if (user) {
        setCurrentUser(user);
        setSidebarOpen(true);
      } else {
        handleLogout();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setCurrentUser(userData);
    setSidebarOpen(true); // Явно открываем сайдбар после авторизации
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setError('');
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  if (isCheckingAuth) {
    return (
      <div className="auth-checking">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="main-page">
      <Navigation 
        onToggleSidebar={toggleSidebar} 
        isSidebarOpen={sidebarOpen}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
      
      {currentUser && <Sidebar isOpen={sidebarOpen} />}

      {currentUser && sidebarOpen && window.innerWidth <= 992 && (
        <div 
          className="sidebar-overlay" 
          onClick={toggleSidebar}
        />
      )}
      
      <div className={`main-content ${currentUser && sidebarOpen ? 'with-sidebar' : ''}`}>
        <Container>
          <Row className="justify-content-center">
            <Col xl={8} lg={10} md={12}>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {!currentUser ? (
                <div className="welcome-section text-center">
                  <h1 className="main-title">Добро пожаловать!</h1>
                  <p className="main-subtitle">
                    Для доступа к функциям системы войдите в свой аккаунт
                  </p>
                </div>
              ) : (
                <UserDashboard user={currentUser} onLogout={handleLogout} />
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default MainPage;