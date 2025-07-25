import React, { useState } from 'react';
import { Nav, Collapse } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { Book, Laptop, ChevronDown, ChevronRight } from 'react-bootstrap-icons';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const [openMiniLessons, setOpenMiniLessons] = useState(false);

  const navLinks = [
    { to: '/lessonsVirtual', label: 'Виртуальный класс', icon: <Laptop className="icon" /> },
    { to: '/nouns', label: 'Существительное', icon: <Book className="icon" /> },
    { to: '/functions', label: 'Функция', icon: <Book className="icon" /> },
    { 
      label: 'Мини-уроки', 
      icon: <Book className="icon" />,
      subItems: [
        { to: '/mini-lessons/alphabet', label: 'Алфавит' },
        { to: '/mini-lessons/numbers', label: 'Числа' },
        { to: '/mini-lessons/writing', label: 'Написание' },
        { to: '/mini-lessons/pronunciation', label: 'Произношение' },
        { to: '/mini-lessons/basic-questions', label: 'Основные вопросы' },
        { to: '/mini-lessons/english-names', label: 'Англоязычные имена' }
      ]
    },
    { to: '/kids-lessons/1', label: 'gfriend Kids', icon: <Book className="icon" /> },
  ];

  const toggleMiniLessons = () => {
    setOpenMiniLessons(!openMiniLessons);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <Nav className="flex-column">
          {navLinks.map((link) => {
            if (link.subItems) {
              return (
                <div key={link.label} className="sidebar-dropdown">
                  <Nav.Link
                    onClick={toggleMiniLessons}
                    className={`sidebar-link ${location.pathname.startsWith('/mini-lessons') ? 'active' : ''}`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                    {openMiniLessons ? (
                      <ChevronDown className="dropdown-icon" />
                    ) : (
                      <ChevronRight className="dropdown-icon" />
                    )}
                  </Nav.Link>
                  <Collapse in={openMiniLessons}>
                    <div className="submenu">
                      {link.subItems.map((subItem) => (
                        <Nav.Link
                          as={Link}
                          key={subItem.to}
                          to={subItem.to}
                          className={`sidebar-sub-link ${location.pathname === subItem.to ? 'active' : ''}`}
                        >
                          {subItem.label}
                        </Nav.Link>
                      ))}
                    </div>
                  </Collapse>
                </div>
              );
            }
            return (
              <Nav.Link
                as={Link}
                key={link.to}
                to={link.to}
                className={`sidebar-link ${location.pathname.startsWith(link.to) ? 'active' : ''}`} 
              >
                {link.icon}
                <span>{link.label}</span>
              </Nav.Link>
            );
          })}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;