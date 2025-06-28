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
        setWords(wordsData || []);
        
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
    <div className="words-by-pos-page">
      <Navigation 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        isSidebarOpen={sidebarOpen} 
      />
      
      <div className="words-by-pos-content-wrapper">
        <Sidebar isOpen={sidebarOpen} />
        
        <Container fluid className={`words-by-pos-main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
          <div className={`words-by-pos-sticky-navigation ${animate ? 'animate' : ''}`}>
            <button 
              onClick={() => navigate('/functions')} 
              className="words-by-pos-back-button"
            >
              ← Все части речи
            </button>
            {partOfSpeech && (
              <div className="words-by-pos-title">
                {partOfSpeech.name}
              </div>
            )}
          </div>

          {loading ? (
            <div className="words-by-pos-loading-message">
              <div className="words-by-pos-spinner"></div>
              <p>Загрузка слов...</p>
            </div>
          ) : words.length > 0 ? (
            <>
              <div 
                className={`words-by-pos-full-width-player ${animate ? 'animate' : ''}`} 
                ref={playerRef}
              >
                <div className="words-by-pos-player-container">
                  <div className="words-by-pos-player-image">
                    <div className="words-by-pos-letter-placeholder">
                      {words[currentWordIndex]?.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="words-by-pos-player-content">
                    <div className="words-by-pos-current-word-display">
                      <h3>{words[currentWordIndex]?.name || 'Нет слова'}</h3>
                      <p>{words[currentWordIndex]?.translation || 'Нет перевода'}</p>
                    </div>
                    <div className="words-by-pos-player-controls">
                      <button 
                        onClick={handlePrev} 
                        className="words-by-pos-control-button" 
                        disabled={words.length <= 1}
                        aria-label="Предыдущее слово"
                      >
                        ⏮
                      </button>
                      <button 
                        onClick={handlePlaySingle} 
                        className="words-by-pos-control-button words-by-pos-play-button"
                        disabled={!words[currentWordIndex]}
                        aria-label="Произнести слово"
                      >
                        ▶
                      </button>
                      <button 
                        onClick={handleNext} 
                        className="words-by-pos-control-button" 
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
                className={`words-by-pos-grid ${animate ? 'animate' : ''}`}
                ref={gridRef}
              >
                <div 
                  className={`words-by-pos-card words-by-pos-all-words-card ${isSpeakingAll ? 'active' : ''}`}
                  onClick={handlePlayAll}
                  aria-label={isSpeakingAll ? 'Остановить воспроизведение' : 'Воспроизвести все слова'}
                >
                  <div className="words-by-pos-image-container words-by-pos-all-words-image">
                    <div className="words-by-pos-all-words-icon">
                      {isSpeakingAll ? '⏹' : '▶'}
                    </div>
                  </div>
                  <div className="words-by-pos-info">
                    <h4 className="words-by-pos-name">Все слова</h4>
                    <p className="words-by-pos-translation">
                      {isSpeakingAll ? 'Остановить' : 'Воспроизвести все'}
                    </p>
                  </div>
                </div>

                {words.map((word, index) => (
                  <div 
                    key={word.id || index} 
                    className={`words-by-pos-card ${index === currentWordIndex ? 'active' : ''}`}
                    onClick={() => handleSelectWord(index)}
                    aria-label={`Слово: ${word.name}`}
                    style={{ transitionDelay: `${index * 0.05}s` }}
                  >
                    <div className="words-by-pos-image-container">
                      <div className="words-by-pos-letter-placeholder small">
                        {word.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="words-by-pos-info">
                      <h4 className="words-by-pos-name">{word.name || 'Нет названия'}</h4>
                      <p className="words-by-pos-translation">{word.translation || 'Нет перевода'}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(word);
                        }}
                        className="words-by-pos-speak-button"
                        aria-label="Произнести слово"
                      >
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={`words-by-pos-empty ${animate ? 'animate' : ''}`}>
              <div className="words-by-pos-empty-icon">📖</div>
              <h3>Слова не найдены</h3>
              <p>Для этой части речи пока нет слов.</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default WordsByPartOfSpeechPage;