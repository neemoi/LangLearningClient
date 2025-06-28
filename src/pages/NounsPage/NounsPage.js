import React, { useState, useEffect, useRef } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../../components/layout/Navigation/Navigation';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import API_CONFIG from '../../components/src/config'; 
import './css/NounsPage.css';

const NounsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [alphabetLetters, setAlphabetLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInfoBox, setShowInfoBox] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();
  const gridRef = useRef(null);

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

    const fetchAlphabet = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter`);
        if (!response.ok) throw new Error('Ошибка при загрузке данных');
        const data = await response.json();
        setAlphabetLetters(data);
        
        setTimeout(() => {
          setAnimate(true);
          if (gridRef.current) {
            gridRef.current.classList.add('animate');
          }
        }, 50);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlphabet();
  }, [isAuthorized]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const handleBackToLesson = () => navigate('/lessonsVirtual/1');

  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <div className="nouns-loader">
        <Spinner animation="grow" variant="primary" className="nouns-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="nouns-loader">
        <Alert variant="danger" className="nouns-alert animate">
          <Alert.Heading>Ошибка загрузки</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="nouns-app">
      <Navigation isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} />

      <main className={`nouns-main ${isSidebarOpen ? 'with-sidebar' : 'no-sidebar'}`}>
        <div className="nouns-content-wrapper">
          <div className="nouns-center">
            <div className={`nouns-back-container ${animate ? 'animate' : ''}`}>
              <button 
                onClick={handleBackToLesson} 
                className="nouns-back-btn"
              >
                <span className="nouns-back-arrow">←</span>
                <span className="nouns-back-text">Назад к уроку</span>
              </button>
            </div>

            {showInfoBox && (
              <div className={`nouns-info ${animate ? 'animate' : ''}`}>
                <p className="nouns-info-text">
                  Все эти существительные, включённые в 800+ Международный курс английского языка,
                  сортированы для вашего удобства.
                </p>
                <button
                  className="nouns-close-btn"
                  onClick={() => setShowInfoBox(false)}
                  aria-label="Закрыть"
                >
                  &times;
                </button>
              </div>
            )}

            <div className={`nouns-header ${animate ? 'animate' : ''}`}>
              <h1 className="nouns-title">Существительные</h1>
              <p className="nouns-subtitle">Выберите букву для просмотра слов</p>
            </div>

            <div className="nouns-grid-container">
              <div 
                className="nouns-grid" 
                ref={gridRef}
              >
                {alphabetLetters.map((letter, index) => (
                  <Link
                    key={letter.id}
                    to={`/alphabet/${letter.symbol}`}
                    className="nouns-letter-card"
                    style={{ transitionDelay: `${index * 0.05}s` }}
                  >
                    <div className="nouns-circle">
                      <span className="nouns-char">{letter.symbol}</span>
                    </div>
                    <div className="nouns-count">{letter.words.length}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NounsPage;