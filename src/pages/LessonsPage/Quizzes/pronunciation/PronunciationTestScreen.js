import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TestNavigationHeader from './../audioImage/TestNavigationHeader';
import './css/PronunciationTestScreen.css';

const PronunciationTestScreen = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  questionTimeLeft,
  score,
  errors,
  selectedAnswerId,
  timeExpired,
  handleAnswerSelect,
  getAnswerClass,
  lessonId,
  lessonTitle
}) => {
  const navigate = useNavigate();
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const handleBackToLesson = () => {
    stopAllAudio();
    navigate(`/lessonsVirtual/${lessonId}`);
  };

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
    if (!('speechSynthesis' in window)) return;

    stopAllAudio();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      setAudioError(true);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const playAudio = async () => {
    stopAllAudio();
    setAudioError(false);

    if (!currentQuestion?.audioUrl) {
      speakText(currentQuestion.correctAnswer);
      return;
    }

    try {
      const response = await fetch(currentQuestion.audioUrl, { method: 'HEAD' });
      if (!response.ok) throw new Error('Audio file not available');
      
      audioRef.current.src = currentQuestion.audioUrl;
      audioRef.current.load();
      
      audioRef.current.onerror = () => {
        setAudioError(true);
        speakText(currentQuestion.correctAnswer);
      };
      
      audioRef.current.onended = () => setIsPlaying(false);
      
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      setAudioError(true);
      speakText(currentQuestion.correctAnswer);
    }
  };

  useEffect(() => {
    if (currentQuestion?.audioUrl) {
      playAudio();
    }
    return stopAllAudio;
  }, [currentQuestionIndex]);

  return (
    <div className="active-test-screen pronunciation-test">
      <TestNavigationHeader 
        lessonId={lessonId} 
        lessonTitle={lessonTitle || 'Текущий урок'} 
      />
      
      <div className="test-header-bar">
        <div className="progress-container">
          <div className="progress-line-container">
            <div 
              className={`progress-line ${selectedAnswerId && selectedAnswerId !== currentQuestion.correctAnswer ? 'incorrect' : ''}`} 
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
      
      <div className="question-content-area pronunciation-content">
        <div className="question-display">
          <h3 className="pronunciation-question-text">
            {currentQuestion.questionText}
          </h3>
          
          {currentQuestion.audioUrl && (
            <button 
              className={`audio-play-button ${isPlaying ? 'playing' : ''}`}
              onClick={playAudio}
              disabled={timeExpired}
              aria-label={isPlaying ? "Остановить воспроизведение" : "Прослушать вопрос"}
            >
              {isPlaying ? (
                <svg className="audio-icon" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/>
                  <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>
                </svg>
              ) : (
                <svg className="audio-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                </svg>
              )}
            </button>
          )}
        </div>
        
        <div className="options-list pronunciation-options">
          {currentQuestion.answers.map((answer) => (
            <div 
              key={answer.id}
              className={`pronunciation-option ${getAnswerClass(answer)}`}
              onClick={() => !selectedAnswerId && !timeExpired && handleAnswerSelect(answer.id, answer.isCorrect)}
            >
              <div className="option-radio">
                <div className={`radio-circle ${selectedAnswerId === answer.id ? 'selected' : ''}`}>
                  {selectedAnswerId === answer.id && <div className="radio-dot"></div>}
                </div>
              </div>
              <div className="option-text">
                {answer.answerText}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PronunciationTestScreen;