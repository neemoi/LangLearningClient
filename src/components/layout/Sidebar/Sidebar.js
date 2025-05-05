import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Book } from 'react-bootstrap-icons';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <h3 className="sidebar-title">Виртуальный класс</h3>
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/nouns" className="sidebar-link">
            <Book className="icon" />
            <span>Существительное</span>
          </Nav.Link>
          <Nav.Link as={Link} to="/functions" className="sidebar-link">
            <Book className="icon" />
            <span>Функция</span>
          </Nav.Link>
          <Nav.Link as={Link} to="/manipulation" className="sidebar-link">
            <Book className="icon" />
            <span>Манипуляция</span>
          </Nav.Link>
          <Nav.Link as={Link} to="/kids" className="sidebar-link">
            <Book className="icon" />
            <span>gfriend Kids</span>
          </Nav.Link>
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;