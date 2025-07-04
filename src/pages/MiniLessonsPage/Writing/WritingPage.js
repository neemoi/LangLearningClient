import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/WritingPage.css';

const WritingPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const categories = [
    { 
      id: 'letters', 
      title: 'Написание букв', 
      count: 52,
      icon: 'https://winner.gfriend.com/Content/images/icon-writingletters.png'
    },
    { 
      id: 'alphabet', 
      title: 'Алфавит', 
      count: 26,
      icon: 'https://winner.gfriend.com/Content/images/icon-writingalphabet.png'
    },
    { 
      id: 'words', 
      title: 'Слова', 
      count: 251,
      icon: 'https://winner.gfriend.com/Content/images/icon-writingwords.png'
    },
    { 
      id: 'sentences', 
      title: 'Предложения', 
      count: 40,
      icon: 'https://winner.gfriend.com/Content/images/icon-writingsentences.png'
    }
  ];

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/writing/${categoryId}`);
  };

  return (
    <div className={`mini-lessons-writing-page ${isMounted ? 'loaded' : ''}`}>
      <Navigation 
        isSidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`mini-lessons-writing-content ${sidebarOpen ? 'with-sidebar' : ''}`}>
        <div className="mini-lessons-writing-container">
          <div className="mini-lessons-back-link">
            <Link to="/lessonsVirtual/1" className="mini-lessons-back-button">
              ← Назад к уроку
            </Link>
          </div>

          <div className="mini-lessons-title-wrapper">
            <h1 className="mini-lessons-writing-title">Написание</h1>
            <div className="mini-lessons-title-underline"></div>
          </div>
          
          <div className="mini-lessons-writing-row">
            {categories.map((category, index) => (
              <div 
                key={category.id}
                className="mini-lessons-writing-category-card"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="mini-lessons-circle-container">
                  <img 
                    src={category.icon} 
                    alt={category.title} 
                    className="mini-lessons-category-image"
                    loading="lazy"
                  />
                  <div className="mini-lessons-count">{category.count}</div>
                </div>
                <h2 className="mini-lessons-category-title">{category.title}</h2>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WritingPage;