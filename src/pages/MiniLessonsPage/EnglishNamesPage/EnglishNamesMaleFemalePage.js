import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import Container from 'react-bootstrap/Container';
import API_CONFIG from '../../../components/src/config';
import './css/EnglishNamesMaleFemalePage.css';

const EnglishNamesMaleFemalePage = () => {
  const { gender } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({
    names: [],
    loading: true,
    error: null,
    currentName: null
  });
  
  const [speech, setSpeech] = useState({
    isSpeaking: false,
    activeGroup: null,
    currentNameIndex: 0,
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
        const endpoint = gender === 'male' ? 'MaleName' : 'FemaleName';
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/${endpoint}`);
        
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

        const names = await response.json();

        setData({
          names: names.map(item => ({
            id: item.id,
            name: item.name,
            imagePath: item.englishName?.imagePath || null,
            gender: gender
          })),
          loading: false,
          error: null,
          currentName: names[0] || null
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
  }, [gender]);

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
      currentNameIndex: 0
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
      currentNameIndex: 0
    }));

    const groupCopy = [...group];
    
    for (let i = 0; i < groupCopy.length; i++) {
      if (cancelRef.current) break;
      
      const name = groupCopy[i];
      
      setData(prev => ({ ...prev, currentName: name }));
      setSpeech(prev => ({ ...prev, currentNameIndex: i }));
      
      await speak(name.name);
      
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
        currentNameIndex: 0
      }));
    }
  };

  const navigateName = (direction) => {
    if (data.names.length <= 1) return;
    
    const currentIndex = data.names.findIndex(n => n.id === data.currentName?.id);
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + data.names.length) % data.names.length
      : (currentIndex + 1) % data.names.length;
    
    setData(prev => ({ ...prev, currentName: data.names[newIndex] }));
  };

  const groupNames = (names, size = 20) => {
    if (!Array.isArray(names)) return [];
    
    const groups = [];
    for (let i = 0; i < names.length; i += size) {
      const group = names.slice(i, i + size);
      if (group.length > 0) {
        groups.push(group);
      }
    }
    return groups;
  };

  const speakName = async (name) => {
    stopSpeaking();
    setData(prev => ({ ...prev, currentName: name }));
    await speak(name.name);
  };

  if (!localStorage.getItem('currentUser')) return null;

  if (data.loading) {
    return (
      <div className="names-gender-container">
        <Navigation
          isSidebarOpen={ui.sidebarOpen}
          onToggleSidebar={() => setUi(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
        />
        <Sidebar isOpen={ui.sidebarOpen} />
        <main className={`names-main-content ${ui.sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="names-loading">Loading...</div>
        </main>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="names-gender-container">
        <Navigation
          isSidebarOpen={ui.sidebarOpen}
          onToggleSidebar={() => setUi(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
        />
        <Sidebar isOpen={ui.sidebarOpen} />
        <main className={`names-main-content ${ui.sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="names-error">Error: {data.error}</div>
        </main>
      </div>
    );
  }

  const groups = groupNames(data.names);
  const genderTitle = gender === 'male' ? 'Мужские имена' : 'Женские имена';

  return (
    <div className="names-gender-container">
      <Navigation 
        sidebarOpen={ui.sidebarOpen}
        onToggleSidebar={() => setUi(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))} 
      />
      
      <div className="names-content-wrapper">
        <Sidebar isOpen={ui.sidebarOpen} />
        
        <Container fluid className={`names-main-content ${ui.sidebarOpen ? '' : 'sidebar-closed'}`}>
          <header className={`names-header ${ui.animate ? 'fade-in' : ''}`}>
            <div className="names-header-row">
              <button 
                onClick={() => navigate('/mini-lessons/english-names')} 
                className="names-back-btn"
              >
                <FaArrowLeft className="names-back-icon" /> Назад к именам
              </button>
              
              <div className="names-title-wrapper">
                <h1 className="names-title">
                  {genderTitle}
                  {data.names.length > 0 && (
                    <span className="names-count">{data.names.length} имен</span>
                  )}
                </h1>
              </div>
            </div>
          </header>

          {data.names.length > 0 ? (
            <>
              <section className={`names-player-section ${ui.animate ? 'slide-up' : ''}`}>
                <div className="names-player-container">
                  <div className="names-image-container">
                    {data.currentName?.imagePath ? (
                      <img 
                        src={data.currentName.imagePath}
                        alt={data.currentName.name}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="names-letter-placeholder">
                        {data.currentName?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  
                  <div className="names-info-section">
                    <div className="names-text-block">
                      <h2 className="names-current-name">{data.currentName?.name || 'Выберите имя'}</h2>
                      <p className="names-position-indicator">
                        {data.names.findIndex(n => n.id === data.currentName?.id) + 1} из {data.names.length}
                      </p>
                    </div>
                    
                    <div className="names-controls-panel">
                      <button 
                        onClick={() => navigateName('prev')} 
                        disabled={data.names.length <= 1}
                        className="names-nav-btn names-prev-btn"
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
                            speakName(data.currentName);
                          }
                        }} 
                        className={`names-play-btn ${speech.isSpeaking ? 'active' : ''}`}
                        disabled={!data.currentName}
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
                        onClick={() => navigateName('next')} 
                        disabled={data.names.length <= 1}
                        className="names-nav-btn names-next-btn"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                        </svg>
                      </button>
                    </div>

                    {speech.showStopButton && (
                      <button
                        onClick={stopSpeaking}
                        className="names-stop-btn"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <path d="M6 6h12v12H6z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {groups.map((group, i) => (
                <section 
                  key={`group-${i}`}
                  className={`names-group-section ${ui.animate ? 'fade-in' : ''}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="names-group-header">
                    <h3 className="names-group-title">Группа {i + 1} <span className="names-group-count">({group.length} имен)</span></h3>
                    <button
                      onClick={() => speakGroup(group, i)}
                      className={`names-group-play-btn ${speech.activeGroup === i ? 'active' : ''}`}
                      disabled={speech.isSpeaking && speech.activeGroup !== i}
                    >
                      {speech.activeGroup === i ? 'Остановить' : 'Озвучить группу'}
                    </button>
                  </div>
                  
                  <div className="names-grid-layout">
                    {group.map((name, j) => (
                      <article 
                        key={`name-${name.id}-${j}`}
                        className={`names-card-item ${data.currentName?.id === name.id ? 'active' : ''} ${
                          speech.activeGroup === i && speech.currentNameIndex === j ? 'speaking' : ''
                        }`}
                        onClick={() => setData(prev => ({ ...prev, currentName: name }))}
                      >
                        <div className="names-card-image-wrapper">
                          {name.imagePath ? (
                            <img 
                              src={name.imagePath}
                              alt={name.name}
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          ) : (
                            <div className="names-letter-placeholder small">
                              {name.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                        <div className="names-card-content">
                          <h4 className="names-card-title">
                            {name.name}
                            {name.gender === 'male' && ' ♂'}
                            {name.gender === 'female' && ' ♀'}
                          </h4>
                          <button 
                            className="names-card-play-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakName(name);
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
            <div className={`names-empty-state ${ui.animate ? 'bounce-in' : ''}`}>
              <div className="names-empty-icon">📖</div>
              <h3 className="names-empty-title">Нет имен</h3>
              <p className="names-empty-text">Пока нет имен для изучения</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default EnglishNamesMaleFemalePage;