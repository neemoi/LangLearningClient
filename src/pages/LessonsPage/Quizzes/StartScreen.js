import React from 'react';
import './ImageTestPage.css';

const StartScreen = ({ testType, totalQuestions, quizData, startTest }) => (
  <div className="minimal-start-screen">
    <div className="minimal-start-content">
      <h1 className="minimal-test-title">
        {quizData.nouns.find(q => q.id === testType)?.tooltip}
      </h1>
      <p className="minimal-questions-count">{totalQuestions} вопросов</p>
      <button 
        className="minimal-start-btn" 
        onClick={startTest}
      >
        Начать
      </button>
    </div>
  </div>
);

export default StartScreen;