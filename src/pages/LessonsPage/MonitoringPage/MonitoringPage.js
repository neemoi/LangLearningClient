import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_CONFIG from '../../../components/src/config';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './MonitoringPage.css';

const MonitoringPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [data, setData] = useState({
    loading: true,
    stats: null,
    words: [],
    progress: null,
    wordProgress: [],
    testProgress: null,
    error: null
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isMobile = useMemo(() => windowWidth <= 480, [windowWidth]);
  const isTablet = useMemo(() => windowWidth <= 768, [windowWidth]);

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
      setWindowWidth(window.innerWidth);
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

      const [statsRes, wordsRes, progressRes, wordProgressRes, testProgressRes] = await Promise.all([
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
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/word-progress/user/${user.id}/${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/test-progress/${user.id}/${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (statsRes.status === 401 || wordsRes.status === 401 || progressRes.status === 401 || 
          wordProgressRes.status === 401 || testProgressRes.status === 401) {
        handleUnauthorized();
        return;
      }

      const [stats, words, progress, wordProgress, testProgress] = await Promise.all([
        statsRes.ok ? statsRes.json() : null,
        wordsRes.ok ? wordsRes.json() : [],
        progressRes.ok ? progressRes.json() : null,
        wordProgressRes.ok ? wordProgressRes.json() : [],
        testProgressRes.ok ? testProgressRes.json() : null
      ]);

      setData({
        loading: false,
        stats,
        words,
        progress,
        wordProgress,
        testProgress,
        error: null
      });
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      setData({
        loading: false,
        stats: null,
        words: [],
        progress: null,
        wordProgress: [],
        testProgress: null,
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

  const getWordStatus = useMemo(() => (wordId) => {
    if (!data.wordProgress || data.wordProgress.length === 0) {
      return { mastered: false, testStatus: {} };
    }
    
    const testTypes = ['ImageAudioChoice', 'AudioChoice', 'ImageChoice', 'Spelling'];
    const testStatus = {};
    
    testTypes.forEach(type => {
      const typeAttempts = data.wordProgress.filter(
        wp => wp.wordId === wordId && wp.questionType === type
      );
      testStatus[type] = typeAttempts.some(attempt => attempt.isCorrect);
    });
    
    const mastered = testStatus['ImageAudioChoice'] && 
                   testStatus['AudioChoice'] && 
                   testStatus['ImageChoice'] && 
                   testStatus['Spelling'];
    
    return { mastered, testStatus };
  }, [data.wordProgress]);

  const handleBackClick = () => {
    navigate(`/lessonsVirtual/${lessonId}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (data.loading) {
    return (
      <div className="vocab-page">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <LoadingScreen />
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="vocab-page">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <ErrorScreen message={data.error} isMobile={isMobile} />
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
    <div className="vocab-page">
      <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      
      <div className="vocab-content-wrapper">
        <Sidebar isOpen={sidebarOpen} />
        
        <main className={`vocab-main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
          <div className="vocab-container">
            <BackButton 
              onClick={handleBackClick} 
              lessonTitle={progress.lessonTitle}
              isMobile={isMobile}
            />
            
            <VocabHeader 
              title={progress.lessonTitle} 
              score={progress.score}
              completedAt={progress.completedAt}
              isMobile={isMobile}
            />
            
            <div className="vocab-progress-lines">
              <ProgressLine 
                title="Банк слов"
                description="Выученные слова"
                current={stats.learnedWordsInLesson}
                total={stats.totalWordsInLesson}
                color="#4CAF50"
                icon="📚"
                isMobile={isMobile}
              />
              
              <ProgressLine 
                title="Пул памяти"
                description="Всего выучено"
                current={stats.learnedWordsOverall}
                total={stats.totalWordsOverall}
                color="#2196F3"
                icon="🧠"
                isMobile={isMobile}
              />
            </div>

            {data.progress?.testResults && (
              <TestResultsSection 
                testResults={data.progress.testResults} 
                isMobile={isMobile} 
                isTablet={isTablet}
              />
            )}
            
            <VocabProgressTable 
              words={data.words} 
              wordProgress={data.wordProgress}
              getWordStatus={getWordStatus}
              isMobile={isMobile}
              isTablet={isTablet}
            />
            
            <VocabCards 
              words={data.words} 
              getWordStatus={getWordStatus}
              isMobile={isMobile}
            />
            
            <VocabResources 
              videoUrl={progress.videoUrl}
              pdfUrl={progress.pdfUrl}
              isMobile={isMobile}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

const BackButton = ({ onClick, lessonTitle, isMobile }) => (
  <button className="vocab-back-button" onClick={onClick}>
    <span className="vocab-back-arrow">←</span> 
    {isMobile ? 'Назад' : `Назад к уроку "${lessonTitle}"`}
  </button>
);

const VocabHeader = ({ title, score, completedAt, isMobile }) => {
  const formattedTitle = isMobile 
    ? (title.length > 15 ? `${title.substring(0, 15)}...` : title)
    : title;

  return (
    <header className="vocab-header">
      <div className="vocab-header-content">
        <h1>{formattedTitle}</h1>
        <div className="vocab-header-meta">
          <div className="vocab-completion-date">
            {new Date(completedAt).toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'short',
              year: !isMobile ? 'numeric' : undefined
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

const ProgressLine = ({ title, description, current, total, color, icon, isMobile }) => {
  const percentage = Math.round((current / total) * 100);
  
  const shortTitle = isMobile 
    ? (title.length > 8 ? `${title.substring(0, 8)}...` : title)
    : title;
  
  const shortDescription = isMobile 
    ? (description.length > 12 ? `${description.substring(0, 12)}...` : description)
    : description;

  return (
    <div className="vocab-progress-card">
      <div className="vocab-progress-header">
        <span className="vocab-progress-icon">{icon}</span>
        <div className="vocab-progress-text">
          <h3>{shortTitle}</h3>
          <p className="vocab-progress-description">{shortDescription}</p>
        </div>
      </div>
      
      <div className="vocab-progress-content">
        <div className="vocab-progress-track">
          <div 
            className="vocab-progress-fill" 
            style={{ width: `${percentage}%`, backgroundColor: color }}
          ></div>
        </div>
        
        <div className="vocab-progress-numbers">
          <span className="vocab-current-value">{current}</span>
          <span className="vocab-total-value">/{total}</span>
          {!isMobile && <span className="vocab-percentage">({percentage}%)</span>}
        </div>
      </div>
    </div>
  );
};

const TestResultsSection = ({ testResults, isMobile, isTablet }) => {
  const filteredTests = testResults.filter(test => 
    ['advanced-test', 'pronunciation', 'grammar'].includes(test.testType)
  );

  if (filteredTests.length === 0) return null;

  return (
    <div className="test-results-section">
      <h2 className="section-title">Результаты тестов</h2>
      <div className="test-results-grid">
        {filteredTests.map(test => {
          let icon, color, title;
          switch(test.testType) {
            case 'advanced-test':
              icon = '🧩';
              color = '#9C27B0';
              title = isMobile ? 'Тест' : (isTablet ? 'Продв. тест' : 'Продвинутый тест');
              break;
            case 'pronunciation':
              icon = '🎤';
              color = '#FF9800';
              title = isMobile ? 'Произн.' : 'Произношение';
              break;
            case 'grammar':
              icon = '✍️';
              color = '#3F51B5';
              title = isMobile ? 'Грамм.' : 'Грамматика';
              break;
            default:
              icon = '📝';
              color = '#607D8B';
              title = test.testType;
          }

          return (
            <div key={`${test.testType}-${test.quizId}`} className="test-result-card">
              <div className="test-result-header">
                <span className="test-icon" style={{ backgroundColor: color }}>
                  {icon}
                </span>
                <h3>{title}</h3>
              </div>
              <div className="test-result-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${test.score}%`, 
                      backgroundColor: color 
                    }}
                  ></div>
                </div>
                <div className="progress-numbers">
                  <span className="percentage">
                    {test.score}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VocabProgressTable = ({ words, wordProgress, getWordStatus, isMobile, isTablet }) => {
  const testTypes = [
    { type: 'ImageAudioChoice', label: isMobile ? 'А+К' : (isTablet ? 'Ауд+Карт' : 'Аудио + Картинка') },
    { type: 'AudioChoice', label: isMobile ? 'Аудио' : 'Аудио' },
    { type: 'ImageChoice', label: isMobile ? 'Карт.' : 'Картинка' },
    { type: 'Spelling', label: isMobile ? 'Прав.' : 'Правописание' }
  ];

  return (
    <div className="vocab-table-section">
      <h2 className="vocab-section-title">Прогресс изучения</h2>
      {words.length === 0 ? (
        <NoDataScreen />
      ) : (
        <div className="vocab-table-container">
          <table className="vocab-progress-table">
            <thead>
              <tr>
                <th className="vocab-word-column">Слово</th>
                {testTypes.map(test => (
                  <th key={test.type} className="vocab-level-column" title={test.label}>
                    {test.label}
                  </th>
                ))}
                <th className="vocab-status-column">Статус</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word) => {
                const { mastered, testStatus } = getWordStatus(word.id);
                const wordName = isMobile && word.name.length > 6 ? `${word.name.substring(0, 6)}...` : word.name;
                
                return (
                  <tr key={word.id} className="vocab-progress-row">
                    <td className="vocab-word-column">
                      <div className="vocab-word-cell">
                        <img 
                          src={word.imageUrl || '/default-word.png'} 
                          alt={word.name} 
                          loading="lazy"
                          className="vocab-word-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-word.png';
                          }}
                        />
                        <span className="vocab-word-name">{wordName}</span>
                      </div>
                    </td>
                    {testTypes.map(test => (
                      <td key={test.type} className="vocab-level-column">
                        <div 
                          className={`vocab-level-indicator ${testStatus[test.type] ? 'completed' : ''}`}
                          title={testStatus[test.type] ? 'Пройдено' : 'Не пройдено'}
                        >
                          {testStatus[test.type] ? '✓' : '○'}
                        </div>
                      </td>
                    ))}
                    <td className="vocab-status-column">
                      <div 
                        className={`vocab-status-indicator ${mastered ? 'mastered' : 'learning'}`}
                        title={mastered ? 'Слово выучено' : 'Слово изучается'}
                      >
                        {isMobile ? (mastered ? '✓' : '…') : (mastered ? 'Выучено' : 'Изучается')}
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

const VocabCards = ({ words, getWordStatus, isMobile }) => {
  const gridColumns = isMobile ? 2 : 3;
  
  return (
    <div className="vocab-cards-section">
      <h2 className="vocab-section-title">Слова урока</h2>
      {words.length === 0 ? (
        <NoDataScreen />
      ) : (
        <div 
          className="vocab-cards-grid" 
          style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}
        >
          {words.map(word => {
            const { mastered } = getWordStatus(word.id);
            const wordName = isMobile && word.name.length > 8 ? `${word.name.substring(0, 8)}...` : word.name;
            const wordTranslation = isMobile && word.translation.length > 10 ? `${word.translation.substring(0, 10)}...` : word.translation;
            
            return (
              <div key={word.id} className={`vocab-word-card ${mastered ? 'mastered' : ''}`}>
                <div className="vocab-card-image">
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
                <div className="vocab-card-info">
                  <h4>{wordName}</h4>
                  <p>{wordTranslation}</p>
                  {!isMobile && (
                    <div className="vocab-card-status">
                      <span className={`vocab-status-dot ${mastered ? 'mastered' : 'learning'}`}></span>
                      {mastered ? 'Выучено' : 'Изучается'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const VocabResources = ({ videoUrl, pdfUrl, isMobile }) => {
  if (!videoUrl && !pdfUrl) return null;

  return (
    <div className="vocab-resources-section">
      <h2 className="vocab-section-title">Ресурсы урока</h2>
      <div className="vocab-resources-cards">
        {videoUrl && (
          <div className="vocab-resource-card video-resource">
            <div className="vocab-resource-icon-container">
              <span className="vocab-resource-icon">🎥</span>
            </div>
            <div className="vocab-resource-content">
              <h3>{isMobile ? 'Видео' : 'Видео урока'}</h3>
              <p>{isMobile ? 'Просмотр видео' : 'Просмотрите видеоурок для лучшего понимания материала'}</p>
              <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="vocab-resource-button"
              >
                {isMobile ? '▶️ Смотреть' : 'Смотреть видео'}
              </a>
            </div>
          </div>
        )}
        
        {pdfUrl && (
          <div className="vocab-resource-card pdf-resource">
            <div className="vocab-resource-icon-container">
              <span className="vocab-resource-icon">📘</span>
            </div>
            <div className="vocab-resource-content">
              <h3>{isMobile ? 'Материалы' : 'PDF материалы'}</h3>
              <p>{isMobile ? 'Доп. материалы' : 'PDF с дополнительными материалами по уроку'}</p>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="vocab-resource-button"
              >
                {isMobile ? '📥 Скачать' : 'Скачать PDF'}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="vocab-loading-screen">
    <div className="vocab-spinner"></div>
    <p>Загрузка данных...</p>
  </div>
);

const ErrorScreen = ({ message, isMobile }) => (
  <div className="vocab-error-screen">
    <div className="vocab-error-icon">⚠️</div>
    <h3>Ошибка загрузки</h3>
    <p>{isMobile && message.length > 80 ? `${message.substring(0, 80)}...` : message}</p>
    <button 
      className="vocab-retry-button" 
      onClick={() => window.location.reload()}
    >
      Попробовать снова
    </button>
  </div>
);

const NoDataScreen = () => (
  <div className="vocab-no-data-screen">
    <div className="vocab-no-data-icon">📭</div>
    <p>Нет данных для отображения</p>
  </div>
);

export default MonitoringPage;