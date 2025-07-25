import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRedo, FaChalkboardTeacher, FaChartBar } from 'react-icons/fa';

const QuizResultsSection = ({ 
  correctCount, 
  wrongCount, 
  getTimeTaken, 
  getPercentage,
  lessonId
}) => {
  const navigate = useNavigate();

  return (
    <div className="ia-results">
      <h2>Тест завершен!</h2>
      
      <div className="ia-results-container">
        <div className="ia-result-item">
          <span className="ia-result-count">{correctCount}</span>
          <span className="ia-result-label">Правильно</span>
        </div>
        <div className="ia-result-item">
          <span className="ia-result-count">{wrongCount}</span>
          <span className="ia-result-label">Ошибки</span>
        </div>
        <div className="ia-result-item">
          <span className="ia-result-count">{getTimeTaken()}</span>
          <span className="ia-result-label">Время</span>
        </div>
        <div className="ia-result-item">
          <span className="ia-result-count">{getPercentage()}%</span>
          <span className="ia-result-label">Результат</span>
        </div>
      </div>
      
      <div className="ia-results-buttons">
        <button 
          className="ia-results-button"
          onClick={() => window.location.reload()}
        >
          <FaRedo /> Играть снова
        </button>
        <button 
          className="ia-results-button"
          onClick={() => navigate('/kids-lessons/1')}
        >
          <FaChalkboardTeacher /> Виртуальный класс
        </button>
        <button 
          className="ia-results-button"
          onClick={() => navigate(`/kids-monitoring/${lessonId}`)}
        >
          <FaChartBar /> Мониторинг счета
        </button>
      </div>
    </div>
  );
};

export default QuizResultsSection;