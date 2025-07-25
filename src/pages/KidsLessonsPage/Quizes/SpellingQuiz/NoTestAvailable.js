import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChalkboardTeacher, FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NoTestAvailable = ({ lessonId }) => {
  const navigate = useNavigate();

  return (
    <div className="xq-no-test-container">
      <div className="xq-no-test-content">
        <FaExclamationTriangle className="xq-warning-icon" />
        <h3>Тест не найден</h3>
        <p>Для этого урока нет доступного теста по грамматике.</p>
        <div className="xq-no-test-buttons">
          <button 
            className="xq-no-test-button xq-primary"
            onClick={() => navigate(`/kids-lessons/${lessonId}`)}
          >
            <FaChalkboardTeacher /> Вернуться к уроку
          </button>
          <button 
            className="xq-no-test-button"
            onClick={() => navigate('/kids-lessons')}
          >
            <FaHome /> Выбрать другой урок
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoTestAvailable;