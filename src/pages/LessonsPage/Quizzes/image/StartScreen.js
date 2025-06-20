import React from 'react';
import './css/StartScreen.css';

const StartScreen = ({ testType, totalQuestions, quizData, startTest }) => {
  const testInfo = quizData.nouns.find(q => q.id === testType);

  return (
    <div className="clean-start-screen">
      <div className="clean-start-box">
        <h1 className="clean-title">{testInfo?.tooltip || 'Тест'}</h1>
        <p className="clean-subtitle">{totalQuestions} вопросов</p>
        <button className="green-button" onClick={startTest}>
          Начать тест
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
