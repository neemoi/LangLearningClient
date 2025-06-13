import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { Book, Laptop } from 'react-bootstrap-icons';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const navLinks = [
    { to: '/lessonsVirtual', label: 'Виртуальный класс', icon: <Laptop className="icon" /> },
    { to: '/nouns', label: 'Существительное', icon: <Book className="icon" /> },
    { to: '/functions', label: 'Функция', icon: <Book className="icon" /> },
    { to: '/manipulation', label: 'Манипуляция', icon: <Book className="icon" /> },
    { to: '/kids', label: 'gfriend Kids', icon: <Book className="icon" /> },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <Nav className="flex-column">
          {navLinks.map(link => (
            <Nav.Link
              as={Link}
              key={link.to}
              to={link.to}
              className={`sidebar-link ${location.pathname.startsWith(link.to) ? 'active' : ''}`} 
            >
              {link.icon || <Book className="icon" />}
              <span>{link.label}</span>
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;