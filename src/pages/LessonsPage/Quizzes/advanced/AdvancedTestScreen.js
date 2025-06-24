import React from 'react';
import { useNavigate } from 'react-router-dom';
import TestNavigationHeader from './../audioImage/TestNavigationHeader';
import './css/AdvancedTestPage.css';

const AdvancedTestScreen = ({
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

  const handleBackToLesson = () => {
    navigate(`/lessonsVirtual/${lessonId}`);
  };

  return (
    <div className="active-test-screen advanced-test">
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
      
      <div className="question-content-area advanced-content">
        <div className="question-display">
          <h3 className="advanced-question-text">
            {currentQuestion.questionText}
          </h3>
        </div>
        
        <div className="options-list advanced-options">
          {currentQuestion.answers.map((answer) => (
            <div 
              key={answer.id}
              className={`advanced-option ${getAnswerClass(answer)}`}
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

export default AdvancedTestScreen;