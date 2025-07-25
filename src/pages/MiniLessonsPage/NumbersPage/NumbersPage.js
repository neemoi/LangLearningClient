import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/NumbersPage.css';

const NumbersPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const categories = [
    { 
      id: 'math', 
      title: 'Математика', 
      count: 29,
      icon: 'https://winner.gfriend.com/Content/images/logo-numbers.png'
    },
    { 
      id: 'accounting', 
      title: 'Учет', 
      count: 33,
      icon: 'https://winner.gfriend.com/Content/images/icon-counting.png'
    },
    { 
      id: 'ordinal', 
      title: 'Порядковые числа', 
      count: 32,
      icon: 'https://winner.gfriend.com/Content/images/icon-ordinal.png'
    },
    { 
      id: 'money', 
      title: 'Деньги', 
      count: 17,
      icon: 'https://winner.gfriend.com/Content/images/icon-money.png'
    },
    { 
      id: 'time', 
      title: 'Время', 
      count: 49,
      icon: 'https://winner.gfriend.com/Content/images/icon-time.png'
    },
    { 
      id: 'dates', 
      title: 'Даты', 
      count: 65,
      icon: 'https://winner.gfriend.com/Content/images/icon-dates.png'
    }
  ];

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/');
      return;
    }

    setIsMounted(true);
    return () => setIsMounted(false);
  }, [navigate]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/numbers/${categoryId}`);
  };

  if (!localStorage.getItem('currentUser')) {
    return null;
  }

  return (
    <div className={`numbers-page ${isMounted ? 'numbers-page--loaded' : ''}`}>
      <Navigation 
        isSidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`numbers-page__content ${sidebarOpen ? 'numbers-page__content--with-sidebar' : ''}`}>
        <div className="numbers-page__container">
          <div className="numbers-page__back-link">
            <Link to="/lessonsVirtual/1" className="numbers-page__back-button">
              ← Назад к уроку
            </Link>
          </div>

          <div className="numbers-page__header">
            <h1 className="numbers-page__title">Номера</h1>
            <div className="numbers-page__underline"></div>
          </div>
          
          <div className="numbers-page__grid">
            {categories.map((category, index) => (
              <div 
                key={category.id}
                className="numbers-card"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="numbers-card__icon-container">
                  <img 
                    src={category.icon} 
                    alt={category.title} 
                    className="numbers-card__icon"
                    loading="lazy"
                  />
                  <div className="numbers-card__count">{category.count}</div>
                </div>
                <h2 className="numbers-card__title">{category.title}</h2>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NumbersPage;