import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import Container from 'react-bootstrap/Container';
import './WordsPage.css';
import API_CONFIG from '../../../components/src/config';

const WordsPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isSpeakingAll, setIsSpeakingAll] = useState(false);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);
  const cancelAllRef = useRef(false);
  const [lessonInfo, setLessonInfo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [wordStats, setWordStats] = useState({ learned: 0, total: 0, loading: true });

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
      loadVoices();
    }
  }, [navigate, lessonId]);

  const loadVoices = () => {
    const allVoices = window.speechSynthesis.getVoices();
    const englishVoices = allVoices.filter(v => v.lang.startsWith('en'));
    setVoices(englishVoices);
    
    window.speechSynthesis.onvoiceschanged = () => {
      const updatedVoices = window.speechSynthesis.getVoices();
      setVoices(updatedVoices.filter(v => v.lang.startsWith('en')));
    };
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const user = JSON.parse(localStorage.getItem('currentUser'));
      
      const [wordsResponse, lessonResponse] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/api/Lessons/${lessonId}/words`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/Lessons/${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (wordsResponse.status === 401 || lessonResponse.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!wordsResponse.ok || !lessonResponse.ok) {
        throw new Error('Ошибка сети');
      }

      const [wordsData, lessonData] = await Promise.all([
        wordsResponse.json(),
        lessonResponse.json()
      ]);

      setWords(wordsData || []);
      setLessonInfo(lessonData);

      if (user?.id) {
        const statsResponse = await fetch(
          `${API_CONFIG.BASE_URL}/api/UserProgress/word-stats/${user.id}/${lessonId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setWordStats({
            learned: statsData.learnedWordsInLesson || 0,
            total: statsData.totalWordsInLesson || 0,
            loading: false
          });
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setWords([]);
      setWordStats(prev => ({ ...prev, loading: false }));
    } finally {
      setLoading(false);
    }
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userToken');
    navigate('/');
  };

  const speak = (word) => {
    return new Promise((resolve) => {
      if (!word?.name) return resolve();
      
      const utterance = new SpeechSynthesisUtterance(word.name);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      if (voices.length > 0) {
        utterance.voice = voices[0];
      }

      utterance.onend = () => {
        utteranceRef.current = null;
        resolve();
      };

      utterance.onerror = (e) => {
        console.error('Ошибка воспроизведения:', e);
        utteranceRef.current = null;
        resolve();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    cancelAllRef.current = true;
    setIsSpeakingAll(false);
  };

  const handlePlaySingle = async () => {
    if (words.length === 0) return;
    stopSpeaking();
    await speak(words[currentWordIndex]);
  };

  const handlePlayAll = async () => {
    if (words.length === 0) return;

    if (isSpeakingAll) {
      stopSpeaking();
      return;
    }

    cancelAllRef.current = false;
    setIsSpeakingAll(true);

    for (let i = 0; i < words.length; i++) {
      if (cancelAllRef.current) break;
      setCurrentWordIndex(i);
      await speak(words[i]);
      await new Promise(res => setTimeout(res, 400));
    }

    setIsSpeakingAll(false);
  };

  const handlePrev = () => {
    if (words.length <= 1) return;
    stopSpeaking();
    setCurrentWordIndex((prev) => (prev - 1 + words.length) % words.length);
  };

  const handleNext = () => {
    if (words.length <= 1) return;
    stopSpeaking();
    setCurrentWordIndex((prev) => (prev + 1) % words.length);
  };

  const handleSelectWord = (index) => {
    if (index < 0 || index >= words.length) return;
    stopSpeaking();
    setCurrentWordIndex(index);
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="words-page-wrapper">
      <Navigation 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        isSidebarOpen={sidebarOpen} 
      />
      
      <div className="words-content-wrapper">
        <Sidebar isOpen={sidebarOpen} />
        
        <Container fluid className={`words-main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
          <div className="words-sticky-navigation">
            <button onClick={() => navigate(-1)} className="words-back-button">
              ← Назад к уроку {lessonInfo?.title || ''}
            </button>
            {!wordStats.loading && (
              <div className="words-progress">
                <div className="progress-dots">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`progress-dot ${i < Math.round((wordStats.learned / wordStats.total) * 10) ? 'filled' : ''}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="words-loading-message">
              <div className="words-spinner"></div>
              <p>Загрузка слов...</p>
            </div>
          ) : words.length > 0 ? (
            <>
              <div className="words-full-width-player">
                <div className="words-player-container">
                  <div className="words-player-image">
                    <img 
                      src={words[currentWordIndex]?.imageUrl} 
                      alt={words[currentWordIndex]?.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="words-player-content">
                    <div className="words-current-word-display">
                      <h3>{words[currentWordIndex]?.name || 'Нет слова'}</h3>
                      <p>{words[currentWordIndex]?.translation || 'Нет перевода'}</p>
                    </div>
                    <div className="words-player-controls">
                      <button 
                        onClick={handlePrev} 
                        className="words-control-button" 
                        disabled={words.length <= 1}
                        aria-label="Предыдущее слово"
                      >
                        ⏮
                      </button>
                      <button 
                        onClick={handlePlaySingle} 
                        className="words-control-button words-play-button"
                        disabled={!words[currentWordIndex]}
                        aria-label="Произнести слово"
                      >
                        ▶
                      </button>
                      <button 
                        onClick={handleNext} 
                        className="words-control-button" 
                        disabled={words.length <= 1}
                        aria-label="Следующее слово"
                      >
                        ⏭
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="words-grid">
                <div 
                  className={`words-card words-all-words-card ${isSpeakingAll ? 'active' : ''}`}
                  onClick={handlePlayAll}
                  aria-label={isSpeakingAll ? 'Остановить воспроизведение' : 'Воспроизвести все слова'}
                >
                  <div className="words-image-container words-all-words-image">
                    <div className="words-all-words-icon">
                      {isSpeakingAll ? '⏹' : '▶'}
                    </div>
                  </div>
                  <div className="words-info">
                    <h4 className="words-name">Все слова</h4>
                    <p className="words-translation">
                      {isSpeakingAll ? 'Остановить' : 'Воспроизвести все'}
                    </p>
                  </div>
                </div>

                {words.map((word, index) => (
                  <div 
                    key={word.id || index} 
                    className={`words-card ${index === currentWordIndex ? 'active' : ''}`}
                    onClick={() => handleSelectWord(index)}
                    aria-label={`Слово: ${word.name}`}
                  >
                    <div className="words-image-container">
                      <img 
                        src={word.imageUrl} 
                        alt={word.name} 
                        className="words-image" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150x100?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="words-info">
                      <h4 className="words-name">{word.name || 'Нет названия'}</h4>
                      <p className="words-translation">{word.translation || 'Нет перевода'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="words-empty-lesson">
              <div className="words-empty-icon">📖</div>
              <h3>Слова не найдены</h3>
              <p>В этом уроке пока нет слов.</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default WordsPage;