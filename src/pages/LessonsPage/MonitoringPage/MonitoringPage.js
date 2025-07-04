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
    const correctAttempts = wordAttempts.filter(w => w.isCorrect);
    
    let mastered = false;
    if (correctAttempts.length >= 3) {
      const lastThree = wordAttempts.slice(-3);
      mastered = lastThree.length === 3 && lastThree.every(w => w.isCorrect);
    }
    
    return {
      attempts: wordAttempts.length,
      correct: correctAttempts.length,
      mastered
    };
  };

  const getTestCompletionStatus = (wordId) => {
    const testTypes = ['ImageAudioChoice', 'AudioChoice', 'ImageChoice', 'TextChoice'];
    const status = {};
    
    if (!data.progress?.words) {
      testTypes.forEach(type => status[type] = false);
      return status;
    }

    const wordAttempts = data.progress.words.filter(w => w.wordId === wordId);
    
    testTypes.forEach(type => {
      const typeAttempts = wordAttempts.filter(w => w.questionType === type);
      const correctAttempts = typeAttempts.filter(w => w.isCorrect);
      status[type] = correctAttempts.length >= 3; 
    });

    return status;
  };

  const handleBackClick = () => {
    navigate(`/lessonsVirtual/${lessonId}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (data.loading) {
    return (
      <div className="monitoring-page">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <LoadingScreen />
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="monitoring-page">
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
    <div className="monitoring-page">
      <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      
      <div className="monitoring-content-wrapper">
        <Sidebar isOpen={sidebarOpen} />
        
        <main className={`monitoring-main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
          <div className="monitoring-container">
            <BackButton 
              onClick={handleBackClick} 
              lessonTitle={progress.lessonTitle}
            />
            
            <MonitoringHeader 
              title={progress.lessonTitle} 
              score={progress.score}
              completedAt={progress.completedAt}
            />
            
            <div className="monitoring-progress-lines">
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
              getTestCompletionStatus={getTestCompletionStatus} 
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
  <button className="monitoring-back-button" onClick={onClick}>
    <span className="monitoring-back-arrow">←</span> Назад к уроку "{lessonTitle}"
  </button>
);

const MonitoringHeader = ({ title, score, completedAt }) => (
  <header className="monitoring-header">
    <div className="monitoring-header-content">
      <h1>{title}</h1>
      <div className="monitoring-header-meta">
        <div className="monitoring-completion-date">
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
    <div className="monitoring-progress-card">
      <div className="monitoring-progress-header">
        <span className="monitoring-progress-icon">{icon}</span>
        <div className="monitoring-progress-text">
          <h3>{title}</h3>
          <p className="monitoring-progress-description">{description}</p>
        </div>
      </div>
      
      <div className="monitoring-progress-content">
        <div className="monitoring-progress-track">
          <div 
            className="monitoring-progress-fill" 
            style={{ width: `${percentage}%`, backgroundColor: color }}
          ></div>
        </div>
        
        <div className="monitoring-progress-numbers">
          <span className="monitoring-current-value">{current}</span>
          <span className="monitoring-total-value">/{total}</span>
          <span className="monitoring-percentage">({percentage}%)</span>
        </div>
      </div>
    </div>
  );
};

const WordProgressTable = ({ words, getTestCompletionStatus }) => {
  const testTypes = [
    { type: 'ImageAudioChoice', label: 'Аудио + Картинка' },
    { type: 'AudioChoice', label: 'Аудио' },
    { type: 'ImageChoice', label: 'Картинка' },
    { type: 'TextChoice', label: 'Текст' }
  ];

  return (
    <div className="monitoring-table-section">
      <h2 className="monitoring-section-title">Прогресс изучения</h2>
      {words.length === 0 ? (
        <NoDataScreen />
      ) : (
        <div className="monitoring-table-container">
          <table className="monitoring-progress-table">
            <thead>
              <tr>
                <th className="monitoring-word-column">Слово</th>
                {testTypes.map(test => (
                  <th key={test.type} className="monitoring-level-column" title={test.label}>
                    {window.innerWidth > 768 ? test.label : test.label.split(' ')[0]}
                  </th>
                ))}
                <th className="monitoring-status-column">Статус</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word) => {
                const testStatus = getTestCompletionStatus(word.id);
                const wordStatus = {
                  mastered: Object.values(testStatus).every(status => status)
                };

                return (
                  <tr key={word.id} className="monitoring-progress-row">
                    <td className="monitoring-word-column">
                      <div className="monitoring-word-cell">
                        <img 
                          src={word.imageUrl || '/default-word.png'} 
                          alt={word.name} 
                          loading="lazy"
                          className="monitoring-word-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-word.png';
                          }}
                        />
                        <span className="monitoring-word-name">{word.name}</span>
                      </div>
                    </td>
                    {testTypes.map(test => (
                      <td key={test.type} className="monitoring-level-column" title={test.label}>
                        <div className={`monitoring-level-indicator ${testStatus[test.type] ? 'completed' : ''}`}>
                          {testStatus[test.type] ? (
                            <span className="monitoring-checkmark">✓</span>
                          ) : (
                            <span className="monitoring-circle">○</span>
                          )}
                        </div>
                      </td>
                    ))}
                    <td className="monitoring-status-column">
                      <div className={`monitoring-status-indicator ${wordStatus.mastered ? 'mastered' : 'learning'}`}>
                        {wordStatus.mastered ? 'Освоено' : 'Изучается'}
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
};

const WordCards = ({ words, getWordStatus }) => (
  <div className="monitoring-cards-section">
    <h2 className="monitoring-section-title">Слова урока</h2>
    {words.length === 0 ? (
      <NoDataScreen />
    ) : (
      <div className="monitoring-cards-grid">
        {words.map(word => {
          const status = getWordStatus(word.id);
          return (
            <div key={word.id} className={`monitoring-word-card ${status.mastered ? 'mastered' : ''}`}>
              <div className="monitoring-card-image">
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
              <div className="monitoring-card-info">
                <h4>{word.name}</h4>
                <p>{word.translation}</p>
                <div className="monitoring-card-status">
                  <span className={`monitoring-status-dot ${status.mastered ? 'mastered' : 'learning'}`}></span>
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

const LessonResources = ({ videoUrl, pdfUrl }) => {
  if (!videoUrl && !pdfUrl) return null;

  return (
    <div className="monitoring-resources-section">
      <h2 className="monitoring-section-title">Ресурсы урока</h2>
      <div className="monitoring-resources-cards">
        {videoUrl && (
          <div className="monitoring-resource-card video-resource">
            <div className="monitoring-resource-icon-container">
              <span className="monitoring-resource-icon">🎥</span>
            </div>
            <div className="monitoring-resource-content">
              <h3>Видео урока</h3>
              <p>Просмотрите видеоурок для лучшего понимания материала</p>
              <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="monitoring-resource-button"
              >
                Смотреть
              </a>
            </div>
          </div>
        )}
        
        {pdfUrl && (
          <div className="monitoring-resource-card pdf-resource">
            <div className="monitoring-resource-icon-container">
              <span className="monitoring-resource-icon">📘</span>
            </div>
            <div className="monitoring-resource-content">
              <h3>Материалы</h3>
              <p>PDF с дополнительными материалами по уроку</p>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="monitoring-resource-button"
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
  <div className="monitoring-loading-screen">
    <div className="monitoring-spinner"></div>
    <p>Загрузка данных...</p>
  </div>
);

const ErrorScreen = ({ message }) => (
  <div className="monitoring-error-screen">
    <div className="monitoring-error-icon">⚠️</div>
    <h3>Ошибка загрузки</h3>
    <p>{message}</p>
    <button 
      className="monitoring-retry-button" 
      onClick={() => window.location.reload()}
    >
      Попробовать снова
    </button>
  </div>
);

const NoDataScreen = () => (
  <div className="monitoring-no-data-screen">
    <div className="monitoring-no-data-icon">📭</div>
    <p>Нет данных для отображения</p>
  </div>
);

export default MonitoringPage;