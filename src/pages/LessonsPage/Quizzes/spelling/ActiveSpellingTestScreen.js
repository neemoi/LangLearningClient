import React, { useState, useEffect } from 'react';
import TestNavigationHeader from './../audioImage/TestNavigationHeader';
import './css/SpellingTestPage.css';

const ActiveSpellingTestScreen = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  questionTimeLeft,
  score,
  errors,
  timeExpired,
  handleSubmit,
  userInput,
  setUserInput,
  lessonId, 
  lessonTitle
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window);
    setImageError(false);
    setShowCorrectAnswer(false);
    setAnswerChecked(false);
  }, [currentQuestion]);

  const speakText = (text) => {
    if (!speechSupported || !text) {
      console.warn('Speech synthesis not supported or no text provided');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitWrapper(e);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleSubmitWrapper = (e) => {
    e.preventDefault();
    const isCorrect = userInput.trim().toLowerCase() === currentQuestion?.correctAnswer?.toLowerCase();
    handleSubmit(e);
    setAnswerChecked(true);
    if (!isCorrect) {
      setShowCorrectAnswer(true);
    }
  };

  const hasImage = currentQuestion?.imageUrl && !imageError;

  return (
    <div className="active-test-screen spelling-test">
      <TestNavigationHeader 
        lessonId={lessonId} 
        lessonTitle={lessonTitle || 'Текущий урок'} 
      />

      <div className="test-header-bar">
        <div className="progress-container">
          <div className="progress-line-container">
            <div 
              className="progress-line" 
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
          <div className="spelling-prompt">
            Как правильно пишется это слово?
          </div>

          {hasImage && (
            <div className="main-question-image-container">
              <img 
                src={currentQuestion.imageUrl} 
                alt="Question visual" 
                className="main-question-image"
                onError={handleImageError}
              />
            </div>
          )}

          <div className="audio-control-container">
            <button 
              className={`speak-btn ${isPlaying ? 'playing' : ''}`}
              onClick={() => speakText(currentQuestion?.correctAnswer || '')}
              disabled={timeExpired || !speechSupported}
              aria-label={isPlaying ? "Остановить воспроизведение" : "Озвучить слово"}
            >
              {isPlaying ? (
                <>
                  <span className="speak-icon">⏹</span>
                  {!isMobile && <span className="speak-text"></span>}
                </>
              ) : (
                <>
                  <span className="speak-icon">🔊</span>
                  {!isMobile && <span className="speak-text"></span>}
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleSubmitWrapper} className="spelling-form">
            <div className="input-group">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="spelling-input"
                placeholder="Введите слово..."
                disabled={timeExpired || answerChecked}
                autoFocus
              />
              <button 
                type="submit" 
                className="spelling-submit-btn"
                disabled={timeExpired || !userInput.trim() || answerChecked}
              >
                {isMobile ? '✓' : 'Проверить'}
              </button>
            </div>
          </form>

        {(timeExpired || showCorrectAnswer) && (
            <div className="correct-answer-display">
              <div className="correct-answer-label">
                <span className="answer-icon">✅</span>
                Правильный ответ:
              </div>
              <div className="correct-answer-text">
                <strong>{currentQuestion?.correctAnswer}</strong>
              </div>
              {hasImage && (
                <div className="correct-answer-image-container">
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="Correct answer visual" 
                    className="correct-answer-image"
                    onError={handleImageError}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveSpellingTestScreen;
