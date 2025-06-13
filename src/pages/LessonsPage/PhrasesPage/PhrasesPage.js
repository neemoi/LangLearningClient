import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import Container from 'react-bootstrap/Container';
import './PhrasesPage.css';
import API_CONFIG from '../../../components/src/config';

const PhrasesPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isSpeakingAll, setIsSpeakingAll] = useState(false);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);
  const cancelAllRef = useRef(false);
  const [lessonInfo, setLessonInfo] = useState(null);
  const [prevLessonId, setPrevLessonId] = useState(null);
  const [wordStats, setWordStats] = useState({ learned: 0, total: 0, loading: true });
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
      if (lessonId !== prevLessonId) {
        resetState();
        setPrevLessonId(lessonId);
      }
      fetchData();
      loadVoices();
    }
  }, [lessonId, prevLessonId, navigate]);

  const resetState = () => {
    setPhrases([]);
    setCurrentPhraseIndex(0);
    setIsSpeakingAll(false);
    setLoading(true);
    setWordStats({ learned: 0, total: 0, loading: true });
  };

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
      
      if (!user?.id) {
        handleUnauthorized();
        return;
      }

      const [phrasesResponse, lessonResponse] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/api/LessonPhrase?lessonId=${lessonId}`, {
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

      if (phrasesResponse.status === 401 || lessonResponse.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!phrasesResponse.ok || !lessonResponse.ok) {
        throw new Error('Ошибка сети');
      }

      const [phrasesData, lessonData] = await Promise.all([
        phrasesResponse.json(),
        lessonResponse.json()
      ]);

      setPhrases(phrasesData.filter(phrase => phrase.lessonId == lessonId));
      setLessonInfo(lessonData);

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
          learned: statsData.learnedWordsOverall || 0,
          total: statsData.totalWordsOverall || 0,
          loading: false
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setPhrases([]);
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

  const speak = (phrase) => {
    return new Promise((resolve) => {
      if (!phrase?.phraseText) return resolve();
      
      const utterance = new SpeechSynthesisUtterance(phrase.phraseText);
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
    if (phrases.length === 0) return;
    stopSpeaking();
    await speak(phrases[currentPhraseIndex]);
  };

  const handlePlayAll = async () => {
    if (phrases.length === 0) return;
    
    if (isSpeakingAll) {
      stopSpeaking();
      return;
    }

    cancelAllRef.current = false;
    setIsSpeakingAll(true);

    for (let i = 0; i < phrases.length; i++) {
      if (cancelAllRef.current) break;
      setCurrentPhraseIndex(i);
      await speak(phrases[i]);
      await new Promise(res => setTimeout(res, 400));
    }

    setIsSpeakingAll(false);
  };

  const handlePrev = () => {
    if (phrases.length <= 1) return;
    stopSpeaking();
    setCurrentPhraseIndex((prev) => (prev - 1 + phrases.length) % phrases.length);
  };

  const handleNext = () => {
    if (phrases.length <= 1) return;
    stopSpeaking();
    setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
  };

  const handleSelectPhrase = (index) => {
    if (index < 0 || index >= phrases.length) return;
    stopSpeaking();
    setCurrentPhraseIndex(index);
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
    <div className="phrases-page-wrapper">
      <Navigation 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        isSidebarOpen={sidebarOpen} 
      />
      
      <div className="phrases-content-wrapper">
        <Sidebar isOpen={sidebarOpen} />
        
        <Container fluid className={`phrases-main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
          <div className="phrases-sticky-navigation">
            <button onClick={() => navigate(-1)} className="phrases-back-button">
              ← Назад к уроку {lessonInfo?.title || ''}
            </button>
          </div>

          {loading ? (
            <div className="phrases-loading-message">
              <div className="phrases-spinner"></div>
              <p>Загрузка фраз...</p>
            </div>
          ) : phrases.length > 0 ? (
            <>
              <div className="phrases-full-width-player">
                <div className="phrases-player-container">
                  <div className="phrases-player-image">
                    {phrases[currentPhraseIndex]?.imageUrl && (
                      <img 
                        src={phrases[currentPhraseIndex].imageUrl} 
                        alt={phrases[currentPhraseIndex].phraseText} 
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                        }}
                      />
                    )}
                  </div>
                  <div className="phrases-player-content">
                    <div className="phrases-current-phrase-display">
                      <h3>{phrases[currentPhraseIndex]?.phraseText || 'Нет фразы'}</h3>
                      <p>{phrases[currentPhraseIndex]?.translation || ''}</p>
                    </div>
                    <div className="phrases-player-controls">
                      <button 
                        onClick={handlePrev} 
                        className="phrases-control-button" 
                        disabled={phrases.length <= 1}
                        aria-label="Предыдущая фраза"
                      >
                        ⏮
                      </button>
                      <button 
                        onClick={handlePlaySingle} 
                        className="phrases-control-button phrases-play-button"
                        disabled={phrases.length === 0}
                        aria-label="Произнести фразу"
                      >
                        ▶
                      </button>
                      <button 
                        onClick={handleNext} 
                        className="phrases-control-button" 
                        disabled={phrases.length <= 1}
                        aria-label="Следующая фраза"
                      >
                        ⏭
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="phrases-grid">
                <div 
                  className={`phrases-card phrases-all-phrases-card ${isSpeakingAll ? 'active' : ''}`}
                  onClick={handlePlayAll}
                  aria-label={isSpeakingAll ? 'Остановить воспроизведение' : 'Воспроизвести все фразы'}
                >
                  <div className="phrases-image-container phrases-all-phrases-image">
                    <div className="phrases-all-phrases-icon">{isSpeakingAll ? '⏹' : '▶'}</div>
                  </div>
                  <div className="phrases-info">
                    <h4 className="phrases-text">Все фразы</h4>
                    <p className="phrases-translation">{isSpeakingAll ? 'Остановить' : 'Воспроизвести все'}</p>
                  </div>
                </div>

                {phrases.map((phrase, index) => (
                  <div 
                    key={`${phrase.id}-${lessonId}`} 
                    className={`phrases-card ${index === currentPhraseIndex ? 'active' : ''}`}
                    onClick={() => handleSelectPhrase(index)}
                    aria-label={`Фраза: ${phrase.phraseText}`}
                  >
                    <div className="phrases-image-container">
                      {phrase.imageUrl ? (
                        <img 
                          src={phrase.imageUrl} 
                          alt={phrase.phraseText} 
                          className="phrases-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="phrases-image-placeholder">📝</div>
                      )}
                    </div>
                    <div className="phrases-info">
                      <h4 className="phrases-text">{phrase.phraseText}</h4>
                      <p className="phrases-translation">{phrase.translation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="phrases-empty-lesson">
              <div className="phrases-empty-icon">📖</div>
              <h3>Фразы не найдены</h3>
              <p>В этом уроке пока нет фраз.</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default PhrasesPage;