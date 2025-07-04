import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFemale,
  FaMale,
  FaArrowLeft
} from 'react-icons/fa';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/EnglishNamesPage.css';

const EnglishNamesPage = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="english-names-page-layout">
      <Navigation
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`english-names-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="english-names-content-wrapper">
          <header className="english-names-page-header">
            <Link to="/lessonsVirtual/1" className="english-names-back-button">
              <FaArrowLeft className="english-names-back-icon" /> Назад к уроку
            </Link>
          </header>

          <h1 className="english-names-page-title">Англоязычные имена</h1>

          <div className="english-names-center-container">
            <div className="english-names-categories-grid">
              <Link 
                to="/mini-lessons/english-names/male" 
                className="english-names-category-card"
                role="button"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="english-names-circle-thumb">
                  <div className="english-names-icon-fallback">
                    <FaMale />
                  </div>
                </div>
                <h3 className="english-names-category-title">Мужские</h3>
              </Link>

              <Link 
                to="/mini-lessons/english-names/female" 
                className="english-names-category-card"
                role="button"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="english-names-circle-thumb">
                  <div className="english-names-icon-fallback">
                    <FaFemale />
                  </div>
                </div>
                <h3 className="english-names-category-title">Женские</h3>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnglishNamesPage;