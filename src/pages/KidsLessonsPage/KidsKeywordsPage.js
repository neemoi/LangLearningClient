import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSpeechSynthesis } from 'react-speech-kit';
import Navigation from '../../components/layout/Navigation/Navigation';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import API_CONFIG from '../../components/src/config';
import './css/KidsKeywordsPage.css';

const KidsKeywordsPage = () => {
  const { lessonId } = useParams();
  const [words, setWords] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(0);
  
  const { speak, cancel, speaking, voices } = useSpeechSynthesis();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonResponse, wordsResponse] = await Promise.all([
          fetch(`${API_CONFIG.BASE_URL}/api/kid-lessons/${lessonId}`),
          fetch(`${API_CONFIG.BASE_URL}/api/KidWordCard/lesson/${lessonId}`)
        ]);

        if (!lessonResponse.ok) throw new Error('Не удалось загрузить урок');
        if (!wordsResponse.ok) throw new Error('Не удалось загрузить слова');

        const [lessonData, wordsData] = await Promise.all([
          lessonResponse.json(),
          wordsResponse.json()
        ]);

        setCurrentLesson(lessonData);
        setWords(wordsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  const playWord = (word) => {
    cancel();
    speak({ 
      text: word, 
      voice: voices.find(v => v.lang === 'ru-RU') || voices[0],
      rate: 0.9,
      pitch: 1.1
    });
  };

  const playAllWords = () => {
    if (isPlayingAll) {
      cancel();
      setIsPlayingAll(false);
      return;
    }

    if (words.length === 0) return;
    
    setIsPlayingAll(true);
    setCurrentPlayingIndex(0);
    playWord(words[0].word);
  };

  useEffect(() => {
    if (!isPlayingAll) return;

    const timer = setTimeout(() => {
      if (currentPlayingIndex < words.length - 1) {
        const nextIndex = currentPlayingIndex + 1;
        setCurrentPlayingIndex(nextIndex);
        playWord(words[nextIndex].word);
      } else {
        setIsPlayingAll(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isPlayingAll, currentPlayingIndex, words]);

  const startQuiz = (quizNumber) => {
    navigate(`/kids-lessons/${lessonId}/quiz-${quizNumber}`);
  };

  if (loading) {
    return (
      <div className="children-vocabulary-container">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="vocabulary-content-layout">
          <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
          <div className={`vocabulary-main-area ${sidebarOpen ? '' : 'sidebar-minimized'}`}>
            <div className="vocabulary-loading-state">
              <div className="vocabulary-spinner-animation"></div>
              <p className="vocabulary-loading-text">Загружаем слова...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="children-vocabulary-container">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="vocabulary-content-layout">
          <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
          <div className={`vocabulary-main-area ${sidebarOpen ? '' : 'sidebar-minimized'}`}>
            <div className="vocabulary-error-notification">
              <p>{error}</p>
              <button className="vocabulary-reload-button" onClick={() => window.location.reload()}>
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="children-vocabulary-container">
      <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      
      <div className="vocabulary-content-layout">
        <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
        
        <div className={`vocabulary-main-area ${sidebarOpen ? '' : 'sidebar-minimized'}`}>
          <div className="vocabulary-module">
            <div className="vocabulary-header-controls">
              <div className="vocabulary-score-column">
                <div className="vocabulary-score-widget">
                  <a href={`/kids-monitoring/${lessonId}`} className="btn btn-success vocabulary-score-link">
                    <i className="fa fa-check" aria-hidden="true"></i> Мониторинг Счета
                  </a>
                </div>
              </div>

              <div className="vocabulary-lesson-column">
                <div className="vocabulary-lesson-header">
                  <h2 className="vocabulary-lesson-title">
                    Урок {currentLesson?.id}: {currentLesson?.title}
                  </h2>
                </div>
              </div>

              <div className="vocabulary-home-column">
                <button 
                  onClick={() => navigate(`/kids-lessons/${lessonId}`)} 
                  className="btn vocabulary-home-button"
                >
                  <i className="fa fa-arrow-left" aria-hidden="true"></i> Назад
                </button>
              </div>
            </div>

            <div className="vocabulary-playall-section">
              <button 
                onClick={playAllWords} 
                className="btn vocabulary-playall-button"
                disabled={words.length === 0}
              >
                <i className="fa fa-volume-up" aria-hidden="true"></i> 
                {isPlayingAll ? 'Остановить' : 'Прослушать все слова'}
                {isPlayingAll && <span className="vocabulary-playing-animation"></span>}
              </button>
            </div>

            <div className="vocabulary-grid-container">
              <div className="vocabulary-grid-section">
                <div className="vocabulary-word-grid">
                  {words.map((word, index) => (
                    <div key={word.id} className="vocabulary-card">
                      <div 
                        className="vocabulary-image-wrapper"
                        onClick={() => {
                          if (isPlayingAll) {
                            cancel();
                            setIsPlayingAll(false);
                          }
                          playWord(word.word);
                        }}
                      >
                        {word.imageUrl && (
                          <img 
                            src={word.imageUrl} 
                            alt={word.word} 
                            className="vocabulary-word-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="vocabulary-play-icon">
                          <i className="fa fa-play-circle" aria-hidden="true"></i>
                        </div>
                        {isPlayingAll && currentPlayingIndex === index && (
                          <div className="vocabulary-current-playing"></div>
                        )}
                      </div>
                      <div className="vocabulary-word-text">{word.word}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="vocabulary-quiz-section">
              <h3 className="vocabulary-section-heading">Проверь свои знания!</h3>
              <div className="vocabulary-quiz-grid">
                {[1, 2, 3, 4].map((quizNumber) => (
                  <div 
                    key={quizNumber}
                    className="vocabulary-quiz-item" 
                    onClick={() => startQuiz(quizNumber)}
                  >
                    <div className="vocabulary-quiz-icon">
                      <img 
                        src={`https://winner.gfriend.com/Content/images/vc-but0${3 + quizNumber}.png`} 
                        alt={`Викторина ${quizNumber}`} 
                        className="vocabulary-quiz-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="vocabulary-quiz-label">Тест #{quizNumber}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KidsKeywordsPage;