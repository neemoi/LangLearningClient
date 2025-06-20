import React from 'react';
import './AudioTestPage.css';

const ErrorScreen = ({ error }) => (
  <div className="error-screen">
    <h3>Ошибка загрузки теста</h3>
    <p>{error}</p>
    <button 
      className="retry-button" 
      onClick={() => window.location.reload()}
    >
      Попробовать снова
    </button>
  </div>
);

export default ErrorScreen;