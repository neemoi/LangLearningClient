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
    <div className="xq-completion-results">
      <h2>Тест завершен!</h2>
      
      <div className="xq-result-container">
        <div className="xq-result-item">
          <span className="xq-result-count">{correctAnswers}</span>
          <span className="xq-result-label">Правильно</span>
        </div>
        <div className="xq-result-item">
          <span className="xq-result-count">{wrongAnswers}</span>
          <span className="xq-result-label">Ошибки</span>
        </div>
        <div className="xq-result-item">
          <span className="xq-result-count">{calculateTimeTaken()}</span>
          <span className="xq-result-label">Время</span>
        </div>
        <div className="xq-result-item">
          <span className="xq-result-count">{calculatePercentage()}%</span>
          <span className="xq-result-label">Результат</span>
        </div>
      </div>
      
      <div className="xq-completion-buttons">
        <button 
          className="xq-completion-button"
          onClick={() => window.location.reload()}
        >
          <FaRedo /> Играть снова
        </button>
        <button 
          className="xq-completion-button"
          onClick={() => navigate('/kids-lessons/1')}
        >
          <FaChalkboardTeacher /> Виртуальный класс
        </button>
        <button 
          className="xq-completion-button"
          onClick={() => navigate(`/kids-monitoring/${lessonId}`)}
        >
          <FaChartBar /> Мониторинг счета
        </button>
      </div>
    </div>
  );
};

export default ResultsBlock;