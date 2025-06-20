import React, { useState, useRef, useEffect } from 'react';
import TestNavigationHeader from './../audioImage/TestNavigationHeader';
import './css/ImageTestPage.css';

const ActiveTestScreen = ({
  testType,
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  questionTimeLeft,
  score,
  errors,
  selectedAnswer,
  timeExpired,
  handleAnswerSelect,
  getOptionClass, 
  lessonId, 
  lessonTitle
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [audioSupported, setAudioSupported] = useState(false);

  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window);
    setAudioSupported(!!window.HTMLAudioElement);
  }, []);

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const speakText = (text) => {
    if (!speechSupported) {
      console.warn('Speech synthesis not supported');
      return;
    }

    stopAllAudio();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
    };

    try {
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error speaking text:', error);
      setIsPlaying(false);
    }
  };

  const playAudio = () => {
    stopAllAudio();

    if (currentQuestion?.audioUrl && audioSupported) {
      try {
        audioRef.current.src = currentQuestion.audioUrl;
        audioRef.current.load();
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(error => {
              console.error('Audio playback failed:', error);
              speakText(currentQuestion.correctAnswer);
            });
        }
      } catch (error) {
        console.error('Audio setup error:', error);
        speakText(currentQuestion.correctAnswer);
      }
    } else {
      speakText(currentQuestion.correctAnswer);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (testType === 'audio' || testType === 'audio-image') {
      playAudio();
    }
  }, [currentQuestionIndex, testType]);

  return (
    <div className="active-test-screen">
       <TestNavigationHeader 
              lessonId={lessonId} 
              lessonTitle={lessonTitle || 'Текущий урок'} 
            />
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          console.error('Audio element error');
          speakText(currentQuestion.correctAnswer);
        }}
      />

      <div className="test-header-bar">
        <div className="progress-container">
          <div className="progress-line-container">
            <div 
              className={`progress-line ${selectedAnswer ? (selectedAnswer === currentQuestion.correctAnswer ? 'correct' : 'incorrect') : ''}`} 
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Вопрос {currentQuestionIndex + 1} из {totalQuestions}
          </div>
        </div>
        
        <div className="stats-container">
          <div className="time-display">
            <span className="time-icon">⏱️</span>
            <span className="time-value">{questionTimeLeft} сек</span>
          </div>
          <div className="score-display">
            <span className="correct-count">✓ {score}</span>
            <span className="incorrect-count">✗ {errors}</span>
          </div>
        </div>
      </div>
      
      <div className="question-content-area">
        <div className="question-display">
          <button 
            className={`speak-btn ${isPlaying ? 'playing' : ''}`}
            onClick={playAudio}
            title={isPlaying ? "Остановить воспроизведение" : "Озвучить слово"}
            disabled={timeExpired || isPlaying || (!speechSupported && !audioSupported)}
            aria-label={isPlaying ? "Остановить воспроизведение" : "Озвучить слово"}
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 10V14C3 16 4 17 6 17H8.43C8.8 17 9.17 17.11 9.49 17.3L12.89 19.53C15.7 21.4 18 20 18 16.59V7.41C18 4 15.7 2.6 12.89 4.47L9.49 6.7C9.17 6.89 8.8 7 8.43 7H6C4 7 3 8 3 10Z" fill="currentColor"/>
                <path d="M20.59 8.00001C21.37 9.37001 21.81 10.93 21.81 12.5C21.81 14.07 21.37 15.63 20.59 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.97 5.55005C19.74 6.48005 20.25 7.70005 20.25 9.00005C20.25 10.3 19.74 11.52 18.97 12.45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {testType === 'image' && currentQuestion.imageUrl && (
            <div className="image-question-container">
              <img 
                src={currentQuestion.imageUrl} 
                alt="Question" 
                className="question-image-large" 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = 'https://winner.gfriend.com/Content/media/images/lessons48/tmb/aart.jpg';
                }}
              />
            </div>
          )}
          
          {testType === 'audio' && (
            <div className="audio-question-container">
              <div className="audio-prompt">Прослушайте слово и выберите правильный вариант</div>
            </div>
          )}

          {testType === 'audio-image' && currentQuestion.imageUrl && (
            <div className="audio-image-question-container">
              <img 
                src={currentQuestion.imageUrl} 
                alt="Question" 
                className="question-image-large" 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = 'https://winner.gfriend.com/Content/media/images/lessons48/tmb/aart.jpg';
                }}
              />
            </div>
          )}
          
          {testType === 'spelling' && (
            <div className="spelling-question-container">
              <div className="question-prompt">Как правильно пишется это слово?</div>
            </div>
          )}
        </div>
        
        <div className="options-grid">
          {(currentQuestion.options || []).map((option, i) => (
            <button 
              key={i}
              className={getOptionClass(option)}
              onClick={() => !selectedAnswer && !timeExpired && handleAnswerSelect(option)}
              disabled={selectedAnswer || timeExpired}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveTestScreen;