import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaChartBar } from 'react-icons/fa';

const QuizHeader = ({ lessonTitle, lessonId }) => {
  const navigate = useNavigate();

  return (
    <div className="ia-header">
      <button 
        className="ia-header-button"
        onClick={() => navigate(`/kids-monitoring/${lessonId}`)}
      >
        <FaChartBar /> Мониторинг
      </button>
      
      <h3 className="ia-title">{lessonTitle}</h3>

      <button 
        className="ia-header-button"
        onClick={() => navigate('/kids-lessons/1')}
      >
        <FaHome /> Домой
      </button>
    </div>
  );
};

export default QuizHeader;