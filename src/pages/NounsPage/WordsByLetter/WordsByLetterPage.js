import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import Container from 'react-bootstrap/Container';
import API_CONFIG from '../../../components/src/config';
import './../css/WordsByLetterPage.css';

const WordsByLetterPage = () => {
  const { letter } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({
    letter: null,
    words: [],
    loading: true,
    error: null,
    currentWord: null
  });
  
  const [speech, setSpeech] = useState({
    isSpeaking: false,
    activeGroup: null,
    currentWordIndex: 0,
    voices: [],
    showStopButton: false
  });
  
  const [ui, setUi] = useState({
    sidebarOpen: true,
    animate: false
  });

  const synthRef = useRef(null);
  const cancelRef = useRef(false);
  const stopButtonTimeoutRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem('currentUser')) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lettersResponse = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter`);
        if (!lettersResponse.ok) throw new Error(`Ошибка: ${lettersResponse.status}`);

        const allLetters = await lettersResponse.json();
        const foundLetter = allLetters.find(l => l.symbol === letter.toUpperCase());
        
        if (!foundLetter) throw new Error('Буква не найдена');
        
        const letterResponse = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter/${foundLetter.id}`);
        if (!letterResponse.ok) throw new Error(`Ошибка: ${letterResponse.status}`);

        const result = await letterResponse.json();
        
        const words = Array.isArray(result.words) ? result.words.map(item => ({
          id: item.id,
          name: item.name,
          translation: item.translation,
          imagePath: item.imageUrl || null
        })) : [];

        setData({
          letter: { id: result.id, symbol: result.symbol },
          words: words,
          loading: false,
          error: null,
          currentWord: words[0] || null
        });

        setUi(prev => ({ ...prev, animate: true }));
        
      } catch (err) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Ошибка загрузки'
        }));
      }
    };

    fetchData();
    initSpeech();

    return () => {
      stopSpeaking();
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = null;
      }
    };
  }, [letter]);

  const initSpeech = () => {
    if (!window.speechSynthesis) {
      console.error('Браузер не поддерживает синтез речи');
      return;
    }

    synthRef.current = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synthRef.current.getVoices();
      const englishVoices = voices.filter(voice => 
        voice.lang.startsWith('en') || voice.lang.startsWith('en-')
      );
      
      if (englishVoices.length > 0) {
        setSpeech(prev => ({
          ...prev,
          voices: englishVoices
        }));
      }
    };

    loadVoices();
    synthRef.current.onvoiceschanged = loadVoices;
  };

  const speak = (text) => {
    return new Promise((resolve) => {
      if (!text || !synthRef.current || speech.voices.length === 0) {
        console.error('Невозможно воспроизвести: нет текста, синтезатора или голосов');
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = speech.voices[0];
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;

      utterance.onstart = () => {
        cancelRef.current = false;
      };

      utterance.onend = () => {
        if (!cancelRef.current) {
          resolve();
        }
      };

      utterance.onerror = (event) => {
        console.error('Ошибка воспроизведения:', event.error);
        resolve();
      };

      synthRef.current.speak(utterance);
    });
  };

  const stopSpeaking = () => {
    if (!synthRef.current) return;

    cancelRef.current = true;
    synthRef.current.cancel();
    
    setSpeech(prev => ({
      ...prev,
      isSpeaking: false,
      activeGroup: null,
      showStopButton: false,
      currentWordIndex: 0
    }));

    if (stopButtonTimeoutRef.current) {
      clearTimeout(stopButtonTimeoutRef.current);
    }
  };

  const speakGroup = async (group, groupIndex) => {
    if (speech.activeGroup === groupIndex) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

    setSpeech(prev => ({
      ...prev,
      isSpeaking: true,
      activeGroup: groupIndex,
      showStopButton: true,
      currentWordIndex: 0
    }));

    const groupCopy = [...group];
    
    for (let i = 0; i < groupCopy.length; i++) {
      if (cancelRef.current) break;
      
      const word = groupCopy[i];
      
      setData(prev => ({ ...prev, currentWord: word }));
      setSpeech(prev => ({ ...prev, currentWordIndex: i }));
      
      await speak(word.name);
      
      if (!cancelRef.current && i < groupCopy.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    if (!cancelRef.current) {
      setSpeech(prev => ({
        ...prev,
        isSpeaking: false,
        activeGroup: null,
        showStopButton: false,
        currentWordIndex: 0
      }));
    }
  };

  const navigateWord = (direction) => {
    if (data.words.length <= 1) return;
    
    const currentIndex = data.words.findIndex(w => w.id === data.currentWord?.id);
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + data.words.length) % data.words.length
      : (currentIndex + 1) % data.words.length;
    
    setData(prev => ({ ...prev, currentWord: data.words[newIndex] }));
  };

  const groupWords = (words, size = 10) => {
    if (!Array.isArray(words)) return [];
    
    const groups = [];
    for (let i = 0; i < words.length; i += size) {
      const group = words.slice(i, i + size);
      if (group.length > 0) {
        groups.push(group);
      }
    }
    return groups;
  };

  const speakWord = async (word) => {
    stopSpeaking();
    setData(prev => ({ ...prev, currentWord: word }));
    await speak(word.name);
  };

  if (!localStorage.getItem('currentUser')) return null;

  if (data.loading) {
    return (
      <div className="alphabet-page-layout">
        <Navigation
          isSidebarOpen={ui.sidebarOpen}
          onToggleSidebar={() => setUi(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
        />
        <Sidebar isOpen={ui.sidebarOpen} />
        <main className={`alphabet-main-content ${ui.sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="loading-spinner">Loading...</div>
        </main>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="alphabet-page-layout">
        <Navigation
          isSidebarOpen={ui.sidebarOpen}
          onToggleSidebar={() => setUi(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
        />
        <Sidebar isOpen={ui.sidebarOpen} />
        <main className={`alphabet-main-content ${ui.sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="error-message">Error: {data.error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="alphabet-page">
      <Navigation 
        sidebarOpen={ui.sidebarOpen}
        onToggleSidebar={() => setUi(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))} 
      />
      
      <div className="alphabet-content-wrapper">
        <Sidebar isOpen={ui.sidebarOpen} />
        
        <Container fluid className={`alphabet-main-content ${ui.sidebarOpen ? '' : 'sidebar-closed'}`}>
        <header className={`alphabet-header ${ui.animate ? 'fade-in' : ''}`}>
          <div className="alphabet-header-row">
            <button 
              onClick={() => navigate('/nouns')} 
              className="alphabet-back-btn"
            >
              <FaArrowLeft className="alphabet-back-icon" /> Назад к Алфавиту
            </button>
            
            <div className="alphabet-header-spacer"></div>
            
            {data.letter && (
              <h1 className="alphabet-title">
                Буква {data.letter.symbol}
                {data.words.length > 0 && (
                  <span className="alphabet-words-count">{data.words.length} слов</span>
                )}
              </h1>
            )}
          </div>
        </header>

          {data.words.length > 0 ? (
            <>
              <section className={`alphabet-word-player ${ui.animate ? 'slide-up' : ''}`}>
                <div className="alphabet-player-content">
                  <div className="alphabet-word-visual">
                    {data.currentWord?.imagePath ? (
                      <img 
                        src={data.currentWord.imagePath}
                        alt={data.currentWord.name}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="alphabet-letter-fallback">
                        {data.currentWord?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  
                  <div className="alphabet-word-details">
                    <div className="alphabet-word-text-container">
                      <h2>{data.currentWord?.name || 'Выберите слово'}</h2>
                      <p className="alphabet-word-translation">{data.currentWord?.translation || ''}</p>
                      <p className="alphabet-position">
                        {data.words.findIndex(w => w.id === data.currentWord?.id) + 1} из {data.words.length}
                      </p>
                    </div>
                    
                    <div className="alphabet-player-controls">
                      <button 
                        onClick={() => navigateWord('prev')} 
                        disabled={data.words.length <= 1}
                        className="alphabet-control-button alphabet-prev-button"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
                        </svg>
                      </button>
                      
                      <button 
                        onClick={() => {
                          if (speech.isSpeaking) {
                            stopSpeaking();
                          } else {
                            speakWord(data.currentWord);
                          }
                        }} 
                        className={`alphabet-play-button ${speech.isSpeaking ? 'active' : ''}`}
                        disabled={!data.currentWord}
                      >
                        {speech.isSpeaking ? (
                          <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                          </svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => navigateWord('next')} 
                        disabled={data.words.length <= 1}
                        className="alphabet-control-button alphabet-next-button"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                        </svg>
                      </button>
                    </div>

                    {speech.showStopButton && (
                      <button
                        onClick={stopSpeaking}
                        className="alphabet-stop-button"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <path d="M6 6h12v12H6z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {groupWords(data.words).map((group, i) => (
                <section 
                  key={`group-${i}`}
                  className={`alphabet-word-group ${ui.animate ? 'fade-in' : ''}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="alphabet-group-header">
                    <h3>Группа {i + 1} <span>({group.length} слов)</span></h3>
                    <button
                      onClick={() => speakGroup(group, i)}
                      className={speech.activeGroup === i ? 'active' : ''}
                      disabled={speech.isSpeaking && speech.activeGroup !== i}
                    >
                      {speech.activeGroup === i ? 'Остановить' : 'Озвучить группу'}
                    </button>
                  </div>
                  
                  <div className="alphabet-words-grid">
                    {group.map((word, j) => (
                      <article 
                        key={`word-${word.id}-${j}`}
                        className={`alphabet-word-card ${data.currentWord?.id === word.id ? 'active' : ''} ${
                          speech.activeGroup === i && speech.currentWordIndex === j ? 'speaking' : ''
                        }`}
                        onClick={() => setData(prev => ({ ...prev, currentWord: word }))}
                      >
                        <div className="alphabet-card-image">
                          {word.imagePath ? (
                            <img 
                              src={word.imagePath}
                              alt={word.name}
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          ) : (
                            <div className="alphabet-letter-fallback small">
                              {word.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                        <div className="alphabet-card-body">
                          <h4>{word.name}</h4>
                          <p className="alphabet-card-translation">{word.translation}</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              speakWord(word);
                            }}
                            disabled={speech.isSpeaking}
                          >
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </>
          ) : (
            <div className={`alphabet-empty-state ${ui.animate ? 'bounce-in' : ''}`}>
              <div className="alphabet-empty-icon">📖</div>
              <h3>Нет слов</h3>
              <p>Для этой буквы пока нет слов для изучения</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default WordsByLetterPage;