import React from 'react';
import './ImageTestPage.css';

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
  getOptionClass
}) => {
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="active-test-screen">
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
          {(testType === 'image' || testType === 'audio-image') && currentQuestion.imageUrl && (
            <button 
              className="speak-btn"
              onClick={() => speakText(currentQuestion.correctAnswer)}
              title="Озвучить слово"
              disabled={timeExpired}
              aria-label="Озвучить слово"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10V14C3 16 4 17 6 17H8.43C8.8 17 9.17 17.11 9.49 17.3L12.89 19.53C15.7 21.4 18 20 18 16.59V7.41C18 4 15.7 2.6 12.89 4.47L9.49 6.7C9.17 6.89 8.8 7 8.43 7H6C4 7 3 8 3 10Z" fill="currentColor"/>
                <path d="M20.59 8.00001C21.37 9.37001 21.81 10.93 21.81 12.5C21.81 14.07 21.37 15.63 20.59 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.97 5.55005C19.74 6.48005 20.25 7.70005 20.25 9.00005C20.25 10.3 19.74 11.52 18.97 12.45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

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
          
          {testType === 'audio' && currentQuestion.audioUrl && (
            <div className="audio-question-container">
              <div className="audio-player-wrapper">
                <audio src={currentQuestion.audioUrl} controls className="question-audio" />
              </div>
            </div>
          )}

          {testType === 'audio-image' && (
            <div className="audio-image-question-container">
              {currentQuestion.audioUrl && (
                <div className="audio-player-wrapper">
                  <audio src={currentQuestion.audioUrl} controls className="question-audio" />
                </div>
              )}
              {currentQuestion.imageUrl && (
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Question" 
                  className="question-image-large" 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://winner.gfriend.com/Content/media/images/lessons48/tmb/aart.jpg';
                  }}
                />
              )}
            </div>
          )}
          
          {testType === 'spelling' && (
            <div className="spelling-question-container">
              <div className="audio-player-wrapper">
                <audio src={currentQuestion.audioUrl} controls className="question-audio" />
              </div>
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