import React from 'react';
import './ImageTestPage.css';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const ResultsScreen = ({ score, totalQuestions, errors, time, wordStats, startTest }) => {
  const percentage = Math.round((score / Math.max(totalQuestions, 1)) * 100);
  const accuracy = Math.round(((totalQuestions - errors) / Math.max(totalQuestions, 1)) * 100);
  const wordsLearned = wordStats?.learnedWordsInLesson || score;
  const totalWords = wordStats?.totalWordsInLesson || totalQuestions;

  return (
    <div className="results-container">
      <div className="results-content">
        <header className="results-header">
          <h1 className="results-title">Результаты теста</h1>
          <p className="results-subtitle">Тест завершен успешно</p>
        </header>

        <div className="main-score">
          <div className="score-percentage">{percentage}%</div>
          <div className="score-description">общий результат</div>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-label">Точность</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatTime(time)}</div>
            <div className="stat-label">Время</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{wordsLearned}/{totalWords}</div>
            <div className="stat-label">Слова</div>
          </div>
        </div>

        <div className="results-details">
          <div className="detail-row">
            <span>Правильные ответы:</span>
            <span className="correct-answers">{score} из {totalQuestions}</span>
          </div>
          <div className="detail-row">
            <span>Ошибки:</span>
            <span className="errors">{errors}</span>
          </div>
        </div>

        <button className="restart-button" onClick={startTest}>
          Пройти тест снова
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;