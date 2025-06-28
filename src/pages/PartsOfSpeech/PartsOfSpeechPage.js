import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../../components/layout/Navigation/Navigation';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import API_CONFIG from '../../components/src/config'; 
import './css/PartsOfSpeechPage.css';

const PartsOfSpeechPage = () => {
  const [partsOfSpeech, setPartsOfSpeech] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        navigate('/');
      } else {
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!isAuthorized) return;

    const fetchPartsOfSpeech = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/PartOfSpeech`);
        if (!response.ok) throw new Error('Не удалось загрузить части речи');
        const data = await response.json();
        setPartsOfSpeech(data);
        setTimeout(() => setAnimate(true), 100);
      } catch (error) {
        console.error('Ошибка:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartsOfSpeech();
  }, [isAuthorized]);

  const handleGoBack = () => {
    navigate('/lessonsVirtual/1');
  };

  if (!isAuthorized) {
    return null; 
  }

  if (loading) {
    return (
      <div className="parts-of-speech-loading">
        <div className="spinner"></div>
        <p>Загрузка частей речи...</p>
      </div>
    );
  }

  return (
    <div className="parts-of-speech-page">
      <Navigation 
        isSidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`parts-of-speech-content ${sidebarOpen ? 'with-sidebar' : 'no-sidebar'}`}>
        <div className="parts-of-speech-container">
          <div className={`page-header ${animate ? 'animate' : ''}`}>
            <button 
              onClick={handleGoBack} 
              className="back-button"
            >
              <span className="back-arrow">←</span> Назад к уроку
            </button>
            <h1 className="page-title">Части речи</h1>
            <div className="header-spacer"></div>
          </div>
          
          <div className="parts-of-speech-grid">
            {partsOfSpeech.map((part, index) => (
              <div 
                key={part.id}
                className={`part-of-speech-wrapper ${animate ? 'animate' : ''}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <Link 
                  to={`/functions/${part.id}`} 
                  className="part-of-speech-card"
                >
                  <div className="card-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8V12L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="part-of-speech-name">{part.name}</div>
                  <div className="view-words-link">
                    Смотреть слова
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PartsOfSpeechPage;