import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import Container from 'react-bootstrap/Container';
import API_CONFIG from '../../../components/src/config';
import './css/WordsByBasicQuestionsPage.css';

const WordsByBasicQuestionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({
    category: null,
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
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/MainQuestions/categories/${id}`);
        
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

        const result = await response.json();
        
        const words = Array.isArray(result.words) ? result.words.map(item => ({
          id: item.id,
          name: item.name,
          imagePath: item.imagePath || null
        })) : [];

        setData({
          category: { id: result.id, name: result.name },
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
  }, [id, navigate]);

  if (!localStorage.getItem('currentUser')) {
    return null;
  }

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
      utterance.rate = 0.9;
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

  if (data.loading) {
    return (
      <div className="basic-questions-page-layout">
        <Navigation
          isSidebarOpen={ui.sidebarOpen}
          onToggleSidebar={() => setUi(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
        />
        <Sidebar isOpen={ui.sidebarOpen} />
        <main className={`basic-questions-main-content ${ui.sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="loading-spinner">Loading...</div>
        </main>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="basic-questions-page-layout">
        <Navigation
          isSidebarOpen={ui.sidebarOpen}
          onToggleSidebar={() => setUi(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
        />
        <Sidebar isOpen={ui.sidebarOpen} />
        <main className={`basic-questions-main-content ${ui.sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="error-message">Error: {data.error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="basic-questions-page">
      <Navigation 
        sidebarOpen={ui.sidebarOpen}
        onToggleSidebar={() => setUi(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))} 
      />
      
      <div className="basic-questions-content-wrapper">
        <Sidebar isOpen={ui.sidebarOpen} />
        
        <Container fluid className={`basic-questions-main-content ${ui.sidebarOpen ? '' : 'sidebar-closed'}`}>
          <header className={`basic-questions-header ${ui.animate ? 'fade-in' : ''}`}>
            <div className="basic-questions-header-content">
              <button 
                onClick={() => navigate('/mini-lessons/basic-questions')} 
                className="basic-questions-back-btn"
              >
                <FaArrowLeft className="basic-questions-back-icon" /> Назад к Основным вопросам
              </button>
              
              {data.category && (
                <h1 className="basic-questions-category-title">
                  {data.category.name}
                  {data.words.length > 0 && (
                    <span className="basic-questions-words-count">{data.words.length} слов</span>
                  )}
                </h1>
              )}
            </div>
          </header>

          {data.words.length > 0 ? (
            <>
              <section className={`basic-questions-word-player ${ui.animate ? 'slide-up' : ''}`}>
                <div className="basic-questions-player-content">
                  <div className="basic-questions-word-visual">
                    {data.currentWord?.imagePath ? (
                      <img 
                        src={data.currentWord.imagePath}
                        alt={data.currentWord.name}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="basic-questions-letter-fallback">
                        {data.currentWord?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  
                  <div className="basic-questions-word-details">
                    <div className="basic-questions-word-text-container">
                      <h2>{data.currentWord?.name || 'Выберите слово'}</h2>
                      <p className="basic-questions-position">
                        {data.words.findIndex(w => w.id === data.currentWord?.id) + 1} из {data.words.length}
                      </p>
                    </div>
                    
                    <div className="basic-questions-player-controls">
                      <button 
                        onClick={() => navigateWord('prev')} 
                        disabled={data.words.length <= 1}
                        className="basic-questions-control-button basic-questions-prev-button"
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
                        className={`basic-questions-play-button ${speech.isSpeaking ? 'active' : ''}`}
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
                        className="basic-questions-control-button basic-questions-next-button"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                        </svg>
                      </button>
                    </div>

                    {speech.showStopButton && (
                      <button
                        onClick={stopSpeaking}
                        className="basic-questions-stop-button"
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
                  className={`basic-questions-word-group ${ui.animate ? 'fade-in' : ''}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="basic-questions-group-header">
                    <h3>Группа {i + 1} <span>({group.length} слов)</span></h3>
                    <button
                      onClick={() => speakGroup(group, i)}
                      className={speech.activeGroup === i ? 'active' : ''}
                      disabled={speech.isSpeaking && speech.activeGroup !== i}
                    >
                      {speech.activeGroup === i ? '⏹ Остановить' : '▶ Озвучить группу'}
                    </button>
                  </div>
                  
                  <div className="basic-questions-words-grid">
                    {group.map((word, j) => (
                      <article 
                        key={`word-${word.id}-${j}`}
                        className={`basic-questions-word-card ${data.currentWord?.id === word.id ? 'active' : ''} ${
                          speech.activeGroup === i && speech.currentWordIndex === j ? 'speaking' : ''
                        }`}
                        onClick={() => setData(prev => ({ ...prev, currentWord: word }))}
                      >
                        <div className="basic-questions-card-image">
                          {word.imagePath ? (
                            <img 
                              src={word.imagePath}
                              alt={word.name}
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          ) : (
                            <div className="basic-questions-letter-fallback small">
                              {word.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                        <div className="basic-questions-card-body">
                          <h4>{word.name}</h4>
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
            <div className={`basic-questions-empty-state ${ui.animate ? 'bounce-in' : ''}`}>
              <div className="basic-questions-empty-icon">📖</div>
              <h3>Нет слов</h3>
              <p>В этой категории пока нет слов для изучения</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default WordsByBasicQuestionsPage;