import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import Container from 'react-bootstrap/Container';
import API_CONFIG from '../../../components/src/config';
import './../css/WordsByPartOfSpeechPage.css';

const WordsByPartOfSpeechPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [partOfSpeech, setPartOfSpeech] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isSpeakingAll, setIsSpeakingAll] = useState(false);
  const [voices, setVoices] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const utteranceRef = useRef(null);
  const cancelAllRef = useRef(false);
  const playerRef = useRef(null);
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

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [partResponse, wordsResponse] = await Promise.all([
          fetch(`${API_CONFIG.BASE_URL}/api/PartOfSpeech/${id}`),
          fetch(`${API_CONFIG.BASE_URL}/api/PartOfSpeech/${id}/words`)
        ]);

        if (!partResponse.ok || !wordsResponse.ok) {
          throw new Error('Failed to load data');
        }

        const [partData, wordsData] = await Promise.all([
          partResponse.json(),
          wordsResponse.json()
        ]);

        setPartOfSpeech(partData);
        
        if (wordsData && wordsData.length > 0) {
          setWords(wordsData);
        } else {
          setIsEmpty(true);
        }
        
        setTimeout(() => {
          setAnimate(true);
          if (playerRef.current) {
            playerRef.current.classList.add('animate');
          }
          if (gridRef.current) {
            gridRef.current.classList.add('animate');
          }
        }, 50);
        
      } catch (error) {
        console.error('Error:', error);
        setIsEmpty(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    loadVoices();

    return () => {
      stopSpeaking();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [id, isAuthorized]);

  const loadVoices = () => {
    const allVoices = window.speechSynthesis.getVoices();
    const englishVoices = allVoices.filter(v => v.lang.startsWith('en'));
    setVoices(englishVoices);
    
    window.speechSynthesis.onvoiceschanged = () => {
      const updatedVoices = window.speechSynthesis.getVoices();
      setVoices(updatedVoices.filter(v => v.lang.startsWith('en')));
    };
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
        console.error('Speech error:', e);
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

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="functions-page">
      <Navigation 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        isSidebarOpen={sidebarOpen} 
      />
      
      <div className="functions-content-wrapper">
        <Sidebar isOpen={sidebarOpen} />
        
        <Container fluid className={`functions-main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
          {loading ? (
            <div className="functions-loading-message">
              <div className="functions-spinner"></div>
              <p>Загрузка слов...</p>
            </div>
          ) : isEmpty ? (
            <div className="functions-empty-state">
              <div className="empty-state-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="empty-state-title">Для этой части речи пока нет слов</h3>
              <p className="empty-state-message">Мы активно работаем над добавлением новых материалов. Скоро здесь появятся интересные слова!</p>
              <button 
                onClick={() => navigate('/functions')} 
                className="empty-state-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Вернуться к частям речи
              </button>
            </div>
          ) : (
            <>
              <div className={`functions-sticky-navigation ${animate ? 'animate' : ''}`}>
                <button 
                  onClick={() => navigate('/functions')} 
                  className="functions-back-button"
                >
                  ← Все части речи
                </button>
                {partOfSpeech && (
                  <div className="functions-title">
                    {partOfSpeech.name}
                  </div>
                )}
              </div>

              <div 
                className={`functions-full-width-player ${animate ? 'animate' : ''}`} 
                ref={playerRef}
              >
                <div className="functions-player-container">
                  <div className="functions-player-image">
                    <div className="functions-letter-placeholder">
                      {words[currentWordIndex]?.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="functions-player-content">
                    <div className="functions-current-word-display">
                      <h3>{words[currentWordIndex]?.name || 'Нет слова'}</h3>
                      <p>{words[currentWordIndex]?.translation || 'Нет перевода'}</p>
                    </div>
                    <div className="functions-player-controls">
                      <button 
                        onClick={handlePrev} 
                        className="functions-control-button" 
                        disabled={words.length <= 1}
                        aria-label="Предыдущее слово"
                      >
                        ⏮
                      </button>
                      <button 
                        onClick={handlePlaySingle} 
                        className="functions-control-button functions-play-button"
                        disabled={!words[currentWordIndex]}
                        aria-label="Произнести слово"
                      >
                        ▶
                      </button>
                      <button 
                        onClick={handleNext} 
                        className="functions-control-button" 
                        disabled={words.length <= 1}
                        aria-label="Следующее слово"
                      >
                        ⏭
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className={`functions-grid ${animate ? 'animate' : ''}`}
                ref={gridRef}
              >
                <div 
                  className={`functions-card functions-all-words-card ${isSpeakingAll ? 'active' : ''}`}
                  onClick={handlePlayAll}
                  aria-label={isSpeakingAll ? 'Остановить воспроизведение' : 'Воспроизвести все слова'}
                >
                  <div className="functions-image-container functions-all-words-image">
                    <div className="functions-all-words-icon">
                      {isSpeakingAll ? '⏹' : '▶'}
                    </div>
                  </div>
                  <div className="functions-info">
                    <h4 className="functions-name">Все слова</h4>
                    <p className="functions-translation">
                      {isSpeakingAll ? 'Остановить' : 'Воспроизвести все'}
                    </p>
                  </div>
                </div>

                {words.map((word, index) => (
                  <div 
                    key={word.id || index} 
                    className={`functions-card ${index === currentWordIndex ? 'active' : ''}`}
                    onClick={() => handleSelectWord(index)}
                    aria-label={`Слово: ${word.name}`}
                    style={{ transitionDelay: `${index * 0.05}s` }}
                  >
                    <div className="functions-image-container">
                      <div className="functions-letter-placeholder small">
                        {word.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="functions-info">
                      <h4 className="functions-name">{word.name || 'Нет названия'}</h4>
                      <p className="functions-translation">{word.translation || 'Нет перевода'}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(word);
                        }}
                        className="functions-speak-button"
                        aria-label="Произнести слово"
                      >
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default WordsByPartOfSpeechPage;