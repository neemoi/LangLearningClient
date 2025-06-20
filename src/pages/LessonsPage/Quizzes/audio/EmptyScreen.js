import React from 'react';
import './AudioTestPage.css';

const EmptyScreen = () => (
  <div className="empty-screen">
    <h3>Нет доступных вопросов</h3>
    <p>Для этого урока нет вопросов типа AudioChoice</p>
    <button 
      className="retry-button" 
      onClick={() => window.location.reload()}
    >
      Попробовать снова
    </button>
  </div>
);

export default EmptyScreen;