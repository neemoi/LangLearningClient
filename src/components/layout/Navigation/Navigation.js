import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { List, X, PersonCircle, Gear, BoxArrowRight, PersonPlus } from 'react-bootstrap-icons';
import AuthModal from '../../auth/AuthModal/AuthModal';
import RegisterModal from '../../auth/RegisterModal/RegisterModal';
import './Navigation.css';

const Navigation = ({ onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setShowAuthModal(false);
    if (!isSidebarOpen) {
      onToggleSidebar();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userToken');
    setCurrentUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <Navbar bg="orange" variant="dark" expand="lg" className="custom-navbar" fixed="top">
        <Container fluid>
          {currentUser && (
            <Button 
              variant="orange" 
              onClick={onToggleSidebar}
              className="sidebar-toggle-btn"
            >
              {isSidebarOpen ? <X size={24} /> : <List size={24} />}
            </Button>
          )}
          
          <Navbar.Brand as={Link} to="/" className="navbar-brand">
            Language + Learning
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center">
              {currentUser ? (
                <>
                  <Navbar.Text className="nav-user-info me-3">
                    Привет, <strong>{currentUser.username}</strong> ({currentUser.role})
                  </Navbar.Text>

                  <Dropdown align="end">
                    <Dropdown.Toggle 
                      variant="orange" 
                      id="dropdown-profile" 
                      className="profile-toggle"
                    >
                      <div className="profile-avatar">
                        {currentUser.username.charAt(0).toUpperCase()}
                      </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="profile-dropdown">
                      <Dropdown.Header>
                        <div className="d-flex align-items-center">
                          <div className="profile-avatar me-2">
                            {currentUser.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold">{currentUser.username}</div>
                            <div className="text-muted small">{currentUser.role}</div>
                          </div>
                        </div>
                      </Dropdown.Header>
                      
                      <Dropdown.Divider />
                      
                      <Dropdown.Item as={Link} to="/profile">
                        <PersonCircle className="me-2" />
                        Профиль
                      </Dropdown.Item>
                      
                      {currentUser.role === 'Admin' && (
                        <>
                          <Dropdown.Item as={Link} to="/admin">
                            <Gear className="me-2" />
                            Админ-панель
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => setShowRegisterModal(true)}>
                            <PersonPlus className="me-2" />
                            Регистрация
                          </Dropdown.Item>
                        </>
                      )}
                      
                      <Dropdown.Divider />
                      
                      <Dropdown.Item onClick={handleLogout}>
                        <BoxArrowRight className="me-2" />
                        Выход
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              ) : (
                <Button 
                  variant="outline-light" 
                  onClick={() => setShowAuthModal(true)}
                  className="nav-button me-2"
                >
                  Вход
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <AuthModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {currentUser?.role === 'Admin' && (
        <RegisterModal
          show={showRegisterModal}
          onHide={() => setShowRegisterModal(false)}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default Navigation;