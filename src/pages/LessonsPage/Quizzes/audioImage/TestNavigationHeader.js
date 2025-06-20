import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/TestNavigationHeader.css';

const TestNavigationHeader = ({ lessonId, lessonTitle }) => {
  const navigate = useNavigate();

  const handleBackToLesson = () => {
    if (lessonId) {
      navigate(`/lessonsVirtual/${lessonId}`);
    } else {
      console.error('lessonId is undefined');
      navigate('/lessonsVirtual');
    }
  };

  return (
    <div className="test-navigation-header">
      <button 
        onClick={handleBackToLesson}
        className="back-to-lesson-button"
      >
        <span className="back-arrow">←</span> Назад к уроку {lessonTitle || 'Урок'}
      </button>
    </div>
  );
};

export default TestNavigationHeader;