import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/AlphabetMiniLessonsPage.css';

const AlphabetPage = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="writing-alphabet-page">
      <Navigation 
        isSidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`writing-alphabet-main ${sidebarOpen ? 'with-sidebar' : 'without-sidebar'}`}>
        <div className="writing-alphabet-container">
          <div className="writing-alphabet-back">
            <Link to="/mini-lessons/writing" className="writing-alphabet-back-btn">
              ← Назад к Написанию
            </Link>
          </div>

          <div className="writing-alphabet-header">
            <h1 className="writing-alphabet-title">Английский алфавит</h1>
            <p className="writing-alphabet-subtitle">Изучайте написание букв английского алфавита</p>
          </div>

          <div className="writing-alphabet-image-wrapper">
            <div className="writing-alphabet-image-container">
              <img 
                src="https://winner.gfriend.com/Content/media/images/Writing/Alphabets/alphawrite_abc.jpg" 
                alt="Английский алфавит"
                className="writing-alphabet-img"
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