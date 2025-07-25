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
    <div className="image-quiz-completion-results">
      <h2>Тест завершен!</h2>
      
      <div className="image-quiz-result-container">
        <div className="image-quiz-result-item">
          <span className="image-quiz-result-count">{correctAnswers}</span>
          <span className="image-quiz-result-label">Правильно</span>
        </div>
        <div className="image-quiz-result-item">
          <span className="image-quiz-result-count">{wrongAnswers}</span>
          <span className="image-quiz-result-label">Ошибки</span>
        </div>
        <div className="image-quiz-result-item">
          <span className="image-quiz-result-count">{calculateTimeTaken()}</span>
          <span className="image-quiz-result-label">Время</span>
        </div>
        <div className="image-quiz-result-item">
          <span className="image-quiz-result-count">{calculatePercentage()}%</span>
          <span className="image-quiz-result-label">Результат</span>
        </div>
      </div>
      
      <div className="image-quiz-completion-buttons">
        <button 
          className="image-quiz-completion-button"
          onClick={() => window.location.reload()}
        >
          <FaRedo /> Играть снова
        </button>
        <button 
          className="image-quiz-completion-button"
          onClick={() => navigate('/kids-lessons/1')}
        >
          <FaChalkboardTeacher /> Виртуальный класс
        </button>
        <button 
          className="image-quiz-completion-button"
          onClick={() => navigate(`/kids-monitoring/${lessonId}`)}
        >
          <FaChartBar /> Мониторинг счета
        </button>
      </div>
    </div>
  );
};

export default ResultsBlock;