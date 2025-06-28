import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpeechSynthesis } from 'react-speech-kit';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import API_CONFIG from '../../../components/src/config'; 
import './../css/WordsByLetterPage.css';

const WordsByLetterPage = () => {
  const { letter } = useParams();
  const navigate = useNavigate();
  const { speak, cancel, speaking } = useSpeechSynthesis();
  const [letterData, setLetterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [activeWord, setActiveWord] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const speakTimeoutRef = useRef(null);

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

  const groupSize = 10;
  const wordGroups = letterData?.words?.reduce((groups, word, index) => {
    const groupIndex = Math.floor(index / groupSize);
    if (!groups[groupIndex]) groups[groupIndex] = [];
    groups[groupIndex].push(word);
    return groups;
  }, []) || [];

  useEffect(() => {
    if (!isAuthorized) return;

    const fetchLetterData = async () => {
      try {
        const lettersResponse = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter`);
        if (!lettersResponse.ok) throw new Error('Не удалось загрузить буквы алфавита');
        
        const allLetters = await lettersResponse.json();
        const foundLetter = allLetters.find(l => l.symbol === letter.toUpperCase());
        
        if (!foundLetter) throw new Error('Буква не найдена');
        
        const letterResponse = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter/${foundLetter.id}`);
        if (!letterResponse.ok) throw new Error('Не удалось загрузить слова для буквы');
        
        const data = await letterResponse.json();
        
        setLetterData(data);
      } catch (error) {
        console.error('Ошибка:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLetterData();

    return () => {
      cancel();
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
    };
  }, [letter, isAuthorized]);

  const speakWord = (word) => {
    cancel();
    setActiveWord(word);
    speak({ text: word.name, rate: 0.8 });
    
    speakTimeoutRef.current = setTimeout(() => {
      setActiveWord(null);
    }, 1000);
  };

  const speakAllWords = () => {
    if (!letterData?.words || letterData.words.length === 0) return;
    
    cancel();
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }

    let delay = 0;
    letterData.words.forEach((word, index) => {
      speakTimeoutRef.current = setTimeout(() => {
        setCurrentWordIndex(index);
        setActiveWord(word);
        speak({ text: word.name, rate: 0.8 });
        
        if (index === letterData.words.length - 1) {
          setTimeout(() => setActiveWord(null), 1000);
        }
      }, delay);
      
      delay += isAutoPlay ? 1500 : 0;
    });
  };

  const speakGroup = (group) => {
    cancel();
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }

    let delay = 0;
    group.forEach((word, index) => {
      speakTimeoutRef.current = setTimeout(() => {
        const absoluteIndex = letterData.words.findIndex(w => w.id === word.id);
        setCurrentWordIndex(absoluteIndex);
        setActiveWord(word);
        speak({ text: word.name, rate: 0.8 });
        
        if (index === group.length - 1) {
          setTimeout(() => setActiveWord(null), 1000);
        }
      }, delay);
      
      delay += isAutoPlay ? 1500 : 0;
    });
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  const handlePrev = () => {
    if (!letterData?.words || letterData.words.length <= 1) return;
    cancel();
    setCurrentWordIndex((prev) => (prev - 1 + letterData.words.length) % letterData.words.length);
  };

  const handleNext = () => {
    if (!letterData?.words || letterData.words.length <= 1) return;
    cancel();
    setCurrentWordIndex((prev) => (prev + 1) % letterData.words.length);
  };

  const handleSelectWord = (index) => {
    if (!letterData?.words || index < 0 || index >= letterData.words.length) return;
    cancel();
    setCurrentWordIndex(index);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <div className="words-by-letter-loading">
        <div className="spinner"></div>
        <p>Загрузка слов...</p>
      </div>
    );
  }

  if (!letterData) {
    return (
      <div className="words-by-letter-loading">
        <p>Не удалось загрузить слова для буквы {letter.toUpperCase()}</p>
        <button onClick={handleGoBack} className="back-button">
          ← Назад
        </button>
      </div>
    );
  }

  return (
    <div className="words-by-letter-page">
      <Navigation 
        isSidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`words-by-letter-content ${sidebarOpen ? 'with-sidebar' : 'no-sidebar'}`}>
        <div className="words-by-letter-container">
          <div className="letter-header">
            <button onClick={handleGoBack} className="back-button">
              ← Назад
            </button>
            <h1 className="letter-title">Буква {letterData.symbol}</h1>
            <div className="letter-progress">
              {letterData.words?.length > 0 && (
                <span>{currentWordIndex + 1} / {letterData.words.length}</span>
              )}
            </div>
          </div>
          
          {letterData.words?.length > 0 ? (
            <>
              <div className="current-word-block">
                <div className="current-word-card">
                  <div className="word-image-container">
                    {letterData.words[currentWordIndex]?.imageUrl ? (
                      <img 
                        src={letterData.words[currentWordIndex].imageUrl} 
                        alt={letterData.words[currentWordIndex].name}
                        className="word-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentNode.querySelector('.word-letter-placeholder');
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="word-letter-placeholder" style={{ display: letterData.words[currentWordIndex]?.imageUrl ? 'none' : 'flex' }}>
                      {letterData.words[currentWordIndex]?.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="word-info">
                    <h2 className={`word-text ${activeWord?.id === letterData.words[currentWordIndex]?.id ? 'active-word' : ''}`}>
                      {letterData.words[currentWordIndex]?.name}
                    </h2>
                    <p className="word-translation">{letterData.words[currentWordIndex]?.translation}</p>
                    <div className="word-controls">
                      <button 
                        onClick={handlePrev} 
                        className="control-button"
                        disabled={!letterData.words || letterData.words.length <= 1}
                        aria-label="Предыдущее слово"
                      >
                        ←
                      </button>
                      <button 
                        onClick={() => speakWord(letterData.words[currentWordIndex])} 
                        className={`control-button play-button ${speaking ? 'active' : ''}`}
                        disabled={!letterData.words?.[currentWordIndex]}
                        aria-label={speaking ? 'Остановить' : 'Произнести'}
                      >
                        {speaking ? '⏹' : '▶'}
                      </button>
                      <button 
                        onClick={handleNext} 
                        className="control-button"
                        disabled={!letterData.words || letterData.words.length <= 1}
                        aria-label="Следующее слово"
                      >
                        →
                      </button>
                    </div>
                    <div className="word-actions">
                      <button 
                        onClick={() => {
                          if (speaking) {
                            cancel();
                          } else {
                            speakAllWords();
                          }
                        }}
                        className={`action-button ${speaking ? 'active' : ''}`}
                      >
                        {speaking ? '⏹ Остановить' : '▶ Произнести все слова'}
                      </button>
                      <button 
                        onClick={toggleAutoPlay}
                        className={`auto-play-button ${isAutoPlay ? 'active' : ''}`}
                        aria-label="Автовоспроизведение"
                      >
                        {isAutoPlay ? '✓' : '↻'} Автовоспроизведение
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="words-groups-container">
                <div className="groups-grid-container">
                  {wordGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="word-group">
                      <div className="group-header">
                        <h3>Группа {groupIndex + 1}</h3>
                        <button 
                          onClick={() => speakGroup(group)}
                          className={`group-speak-button ${speaking ? 'active' : ''}`}
                        >
                          {speaking ? '⏹' : '▶'} Произнести группу
                        </button>
                      </div>
                      <div className="words-grid">
                        {group.map((word, wordIndex) => {
                          const absoluteIndex = letterData.words.findIndex(w => w.id === word.id);
                          return (
                            <div 
                              key={word.id || wordIndex}
                              className={`word-card ${absoluteIndex === currentWordIndex ? 'active' : ''} ${
                                activeWord?.id === word.id ? 'speaking' : ''
                              }`}
                              onClick={() => handleSelectWord(absoluteIndex)}
                            >
                              {word.imageUrl ? (
                                <div className="word-card-image-container">
                                  <img 
                                    src={word.imageUrl} 
                                    alt={word.name}
                                    className="word-card-image"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      const placeholder = e.target.parentNode.parentNode.querySelector('.word-card-letter');
                                      if (placeholder) placeholder.style.display = 'flex';
                                    }}
                                  />
                                </div>
                              ) : null}
                              <div 
                                className="word-card-letter" 
                                style={{ display: word.imageUrl ? 'none' : 'flex' }}
                              >
                                {word.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="word-card-text">
                                <div className="word-card-name">{word.name}</div>
                                <div className="word-card-translation">{word.translation}</div>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakWord(word);
                                }}
                                className="word-card-speak-button"
                                aria-label="Произнести слово"
                              >
                                ▶
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="no-words-message">
              <div className="no-words-icon">📖</div>
              <h3>Нет слов для буквы {letterData.symbol}</h3>
              <p>Попробуйте другую букву алфавита</p>
              <button onClick={handleGoBack} className="back-button">
                ← Назад к алфавиту
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WordsByLetterPage;