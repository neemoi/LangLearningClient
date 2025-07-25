import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../../components/layout/Sidebar/Sidebar';
import './../css/AlphabetMiniLessonsPage.css';

const AlphabetPage = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="alphabet-app">
      <Navigation 
        isSidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`alphabet-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="container">
          <div className="back-link">
            <Link to="/mini-lessons/writing" className="back-button">
              ← Назад к Написанию
            </Link>
          </div>

          <div className="header-section">
            <h1 className="title">Английский алфавит</h1>
            <p className="subtitle">Изучайте написание букв английского алфавита</p>
          </div>

          <div className="image-wrapper">
            <div className="image-container">
              <img 
                src="https://winner.gfriend.com/Content/media/images/Writing/Alphabets/alphawrite_abc.jpg" 
                alt="Английский алфавит"
                className="alphabet-image"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlphabetPage;