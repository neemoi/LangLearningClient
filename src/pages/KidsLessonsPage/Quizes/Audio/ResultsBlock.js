import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRedo, FaChalkboardTeacher, FaChartBar } from 'react-icons/fa';

const ResultsBlock = ({ 
  correctAnswers, 
  wrongAnswers, 
  calculateTimeTaken, 
  calculatePercentage,
  lessonId
}) => {
  const navigate = useNavigate();

  return (
    <div className="audio-quiz-results">
      <h2>Тест завершен!</h2>
      
      <div className="audio-quiz-results-container">
        <div className="audio-quiz-result-item">
          <span className="audio-quiz-result-count">{correctAnswers}</span>
          <span className="audio-quiz-result-label">Правильно</span>
        </div>
        <div className="audio-quiz-result-item">
          <span className="audio-quiz-result-count">{wrongAnswers}</span>
          <span className="audio-quiz-result-label">Ошибки</span>
        </div>
        <div className="audio-quiz-result-item">
          <span className="audio-quiz-result-count">{calculateTimeTaken()}</span>
          <span className="audio-quiz-result-label">Время</span>
        </div>
        <div className="audio-quiz-result-item">
          <span className="audio-quiz-result-count">{calculatePercentage()}%</span>
          <span className="audio-quiz-result-label">Результат</span>
        </div>
      </div>
      
      <div className="audio-quiz-results-buttons">
        <button 
          className="audio-quiz-results-button"
          onClick={() => window.location.reload()}
        >
          <FaRedo /> Играть снова
        </button>
        <button 
          className="audio-quiz-results-button"
          onClick={() => navigate('/kids-lessons/1')}
        >
          <FaChalkboardTeacher /> Виртуальный класс
        </button>
        <button 
          className="audio-quiz-results-button"
          onClick={() => navigate(`/kids-monitoring/${lessonId}`)}
        >
          <FaChartBar /> Мониторинг счета
        </button>
      </div>
    </div>
  );
};

export default ResultsBlock;