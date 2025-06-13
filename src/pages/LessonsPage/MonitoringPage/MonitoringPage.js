import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_CONFIG from '../../../components/src/config';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './MonitoringPage.css';

const MonitoringPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [data, setData] = useState({
    loading: true,
    stats: null,
    words: [],
    progress: null,
    error: null
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = localStorage.getItem('currentUser');
      const userToken = localStorage.getItem('userToken');
      
      if (!currentUser || !userToken) {
        navigate('/');
        return false;
      }
      return true;
    };

    const authStatus = checkAuth();
    setIsAuthenticated(authStatus);
    
    if (authStatus) {
      fetchData();
    }
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      const token = localStorage.getItem('userToken');
      
      if (!user?.id) {
        throw new Error('Пользователь не авторизован');
      }

      const [statsRes, wordsRes, progressRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/word-stats/${user.id}/${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/Lessons/${lessonId}/words`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/detailed/${user.id}/${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (statsRes.status === 401 || wordsRes.status === 401 || progressRes.status === 401) {
        handleUnauthorized();
        return;
      }

      const [stats, words, progress] = await Promise.all([
        statsRes.ok ? statsRes.json() : null,
        wordsRes.ok ? wordsRes.json() : [],
        progressRes.ok ? progressRes.json() : null
      ]);

      setData({
        loading: false,
        stats,
        words,
        progress,
        error: null
      });
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      setData({
        loading: false,
        stats: null,
        words: [],
        progress: null,
        error: error.message
      });
    }
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userToken');
    navigate('/');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const getWordStatus = (wordId) => {
    if (!data.progress?.words) return { attempts: 0, correct: 0, mastered: false };
    const wordAttempts = data.progress.words.filter(w => w.wordId === wordId);
    return {
      attempts: wordAttempts.length,
      correct: wordAttempts.filter(w => w.isCorrect).length,
      mastered: wordAttempts.length >= 3 && wordAttempts.slice(-3).every(w => w.isCorrect)
    };
  };

  const handleBackClick = () => {
    navigate(`/lessonsVirtual/${lessonId}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (data.loading) {
    return (
      <div className="monitoring-layout">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <LoadingScreen />
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="monitoring-layout">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <ErrorScreen message={data.error} />
      </div>
    );
  }

  const stats = data.stats || {
    learnedWordsInLesson: 0,
    totalWordsInLesson: data.words.length || 1,
    learnedWordsOverall: 0,
    totalWordsOverall: 1
  };

  const progress = data.progress || {
    lessonTitle: 'Урок',
    score: 0,
    completedAt: new Date().toISOString(),
    words: [],
    videoUrl: null,
    pdfUrl: null
  };

  return (
    <div className="monitoring-layout">
      <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      
      <div className="content-wrapper">
        <Sidebar isOpen={sidebarOpen} />
        
        <main className={`main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
          <div className="monitoring-container">
            <BackButton 
              onClick={handleBackClick} 
              lessonTitle={progress.lessonTitle}
            />
            
            <Header 
              title={progress.lessonTitle} 
              score={progress.score}
              completedAt={progress.completedAt}
            />
            
            <div className="progress-lines-row">
              <ProgressLine 
                title="Банк слов"
                description="Выученные слова"
                current={stats.learnedWordsInLesson}
                total={stats.totalWordsInLesson}
                color="#4CAF50"
                icon="📚"
              />
              
              <ProgressLine 
                title="Пул памяти"
                description="Всего выучено"
                current={stats.learnedWordsOverall}
                total={stats.totalWordsOverall}
                color="#2196F3"
                icon="🧠"
              />
            </div>
            
            <WordProgressTable 
              words={data.words} 
              getWordStatus={getWordStatus} 
            />
            
            <WordCards 
              words={data.words} 
              getWordStatus={getWordStatus} 
            />
            
            <LessonResources 
              videoUrl={progress.videoUrl}
              pdfUrl={progress.pdfUrl}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

const BackButton = ({ onClick, lessonTitle }) => (
  <button className="back-button" onClick={onClick}>
    <span className="back-arrow">←</span> Назад к уроку "{lessonTitle}"
  </button>
);

const Header = ({ title, score, completedAt }) => (
  <header className="monitoring-header">
    <div className="header-content">
      <h1>{title}</h1>
      <div className="header-meta">
        <div className={`score-badge ${score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low'}`}>
          <span>{score}%</span>
        </div>
        <div className="completion-date">
          {new Date(completedAt).toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'short',
            year: window.innerWidth > 480 ? 'numeric' : undefined
          })}
        </div>
      </div>
    </div>
  </header>
);

const ProgressLine = ({ title, description, current, total, color, icon }) => {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="progress-line-card">
      <div className="progress-line-header">
        <span className="progress-line-icon">{icon}</span>
        <div className="progress-line-text">
          <h3>{title}</h3>
          <p className="progress-line-description">{description}</p>
        </div>
      </div>
      
      <div className="progress-line-content">
        <div className="progress-line-track">
          <div 
            className="progress-line-fill" 
            style={{ width: `${percentage}%`, backgroundColor: color }}
          ></div>
        </div>
        
        <div className="progress-line-numbers">
          <span className="current-value">{current}</span>
          <span className="total-value">/{total}</span>
          {window.innerWidth > 480 && (
            <span className="percentage">({percentage}%)</span>
          )}
        </div>
      </div>
    </div>
  );
};

const WordCards = ({ words, getWordStatus }) => (
  <div className="word-cards-section">
    <h2 className="section-title">Слова урока</h2>
    {words.length === 0 ? (
      <NoDataScreen />
    ) : (
      <div className="word-cards-grid">
        {words.map(word => {
          const status = getWordStatus(word.id);
          return (
            <div key={word.id} className={`word-card ${status.mastered ? 'mastered' : ''}`}>
              <div className="word-image">
                <img 
                  src={word.imageUrl || '/default-word.png'} 
                  alt={word.name} 
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-word.png';
                  }}
                />
              </div>
              <div className="word-info">
                <h4>{word.name}</h4>
                <p>{word.translation}</p>
                <div className="word-status">
                  <span className={`status-dot ${status.mastered ? 'mastered' : 'learning'}`}></span>
                  {status.mastered ? 'Освоено' : 'Изучается'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const WordProgressTable = ({ words, getWordStatus }) => (
  <div className="progress-table-section">
    <h2 className="section-title">Прогресс изучения</h2>
    {words.length === 0 ? (
      <NoDataScreen />
    ) : (
      <div className="table-container">
        <table className="progress-table">
          <thead>
            <tr>
              <th className="word-column">Слово</th>
              <th className="level-column">1</th>
              <th className="level-column">2</th>
              <th className="level-column">3</th>
              <th className="level-column">4</th>
              <th className="status-column">Статус</th>
            </tr>
          </thead>
          <tbody>
            {words.map((word) => {
              const status = getWordStatus(word.id);
              const progressLevel = Math.min(Math.floor(status.correct / 3 * 4), 4);
              
              return (
                <tr key={word.id} className="progress-row">
                  <td className="word-column">
                    <div className="word-cell">
                      <img 
                        src={word.imageUrl || '/default-word.png'} 
                        alt={word.name} 
                        loading="lazy"
                        className="word-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-word.png';
                        }}
                      />
                      <span className="word-name">{word.name}</span>
                    </div>
                  </td>
                  {[1, 2, 3, 4].map((level) => (
                    <td key={level} className="level-column">
                      <div className={`level-indicator ${progressLevel >= level ? 'completed' : ''}`}>
                        {progressLevel >= level ? (
                          <span className="checkmark">✓</span>
                        ) : (
                          <span className="circle">○</span>
                        )}
                      </div>
                    </td>
                  ))}
                  <td className="status-column">
                    <div className={`status-indicator ${status.mastered ? 'mastered' : 'learning'}`}>
                      {status.mastered ? 'Освоено' : 'Изучается'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const LessonResources = ({ videoUrl, pdfUrl }) => {
  if (!videoUrl && !pdfUrl) return null;

  return (
    <div className="resources-section">
      <h2 className="section-title">Ресурсы урока</h2>
      <div className="resources-cards">
        {videoUrl && (
          <div className="resource-card video-resource">
            <div className="resource-icon-container">
              <span className="resource-icon">🎥</span>
            </div>
            <div className="resource-content">
              <h3>Видео урока</h3>
              <p>Просмотрите видеоурок для лучшего понимания материала</p>
              <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="resource-button"
              >
                Смотреть
              </a>
            </div>
          </div>
        )}
        
        {pdfUrl && (
          <div className="resource-card pdf-resource">
            <div className="resource-icon-container">
              <span className="resource-icon">📘</span>
            </div>
            <div className="resource-content">
              <h3>Материалы</h3>
              <p>PDF с дополнительными материалами по уроку</p>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="resource-button"
              >
                Скачать
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
    <p>Загрузка данных...</p>
  </div>
);

const ErrorScreen = ({ message }) => (
  <div className="error-screen">
    <div className="error-icon">⚠️</div>
    <h3>Ошибка загрузки</h3>
    <p>{message}</p>
    <button 
      className="retry-button" 
      onClick={() => window.location.reload()}
    >
      Попробовать снова
    </button>
  </div>
);

const NoDataScreen = () => (
  <div className="no-data-screen">
    <div className="no-data-icon">📭</div>
    <p>Нет данных для отображения</p>
  </div>
);

export default MonitoringPage;