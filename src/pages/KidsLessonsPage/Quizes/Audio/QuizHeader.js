import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaHome } from 'react-icons/fa';

const QuizHeader = ({ lessonTitle, lessonId }) => {
  const navigate = useNavigate();

  return (
    <div className="audio-quiz-header">
      <button 
        className="audio-quiz-header-button"
        onClick={() => navigate(`/kids-monitoring/${lessonId}`)}
      >
        <FaChartBar /> Мониторинг
      </button>
      
      <h2 className="audio-quiz-title">{lessonTitle}</h2>
      
      <button 
        className="audio-quiz-header-button"
        onClick={() => navigate('/kids-lessons/1')}
      >
        <FaHome /> Домой
      </button>
    </div>
  );
};

export default QuizHeader;