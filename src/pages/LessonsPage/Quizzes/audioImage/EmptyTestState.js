import React from 'react';

const EmptyTestState = ({ testQuestions, lessonId, navigate }) => (
  <div className="empty-test-container">
    <div className="empty-test-card">
      <div className="empty-test-icon">🎬</div>
      <h2>Тест "Аудио + Изображение" недоступен</h2>
      <p>Для этого урока нет вопросов для данного теста.</p>
      
      <div className="test-stats-grid">
        <div className="test-stat-card">
          <div className="stat-icon">🖼️</div>
          <div className="stat-count">{testQuestions.image.length}</div>
          <div className="stat-name">Изображения</div>
        </div>
        <div className="test-stat-card">
          <div className="stat-icon">🔊</div>
          <div className="stat-count">{testQuestions.audio.length}</div>
          <div className="stat-name">Аудио</div>
        </div>
        <div className="test-stat-card">
          <div className="stat-icon">🎬</div>
          <div className="stat-count">{testQuestions['audio-image'].length}</div>
          <div className="stat-name">Аудио+Изображение</div>
        </div>
        <div className="test-stat-card">
          <div className="stat-icon">✍️</div>
          <div className="stat-count">{testQuestions.spelling.length}</div>
          <div className="stat-name">Правописание</div>
        </div>
      </div>
      
      <button 
        className="return-btn" 
        onClick={() => navigate(`/lessonsVirtual/${lessonId}`)}
      >
        Вернуться к уроку
      </button>
    </div>
  </div>
);

export default EmptyTestState;