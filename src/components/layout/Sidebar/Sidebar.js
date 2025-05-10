import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { Book } from 'react-bootstrap-icons';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const navLinks = [
    { to: '/nouns', label: 'Существительное' },
    { to: '/functions', label: 'Функция' },
    { to: '/manipulation', label: 'Манипуляция' },
    { to: '/kids', label: 'gfriend Kids' },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <h3 className="sidebar-title">Виртуальный класс</h3>
        <Nav className="flex-column">
          {navLinks.map(link => (
            <Nav.Link
              as={Link}
              key={link.to}
              to={link.to}
              className={`sidebar-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              <Book className="icon" />
              <span>{link.label}</span>
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;
