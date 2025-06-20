import React, { useEffect } from 'react';
import './../image/css/ImageTestPage.css';
import API_CONFIG from '../../../../components/src/config';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const ResultsImageScreen = ({ 
  score, 
  totalQuestions, 
  errors, 
  time, 
  wordStats, 
  startTest,
  lessonId,
  testType = 'image'
}) => {
  const percentage = Math.round((score / Math.max(totalQuestions, 1)) * 100);
  
  useEffect(() => {
    const sendTestResults = async () => {
      const token = localStorage.getItem('userToken');
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }

      const completedAt = new Date().toISOString();
      const scorePercentage = percentage;

      const testTypeMap = {
        'image': { testType: "image", quizId: 1 },
        'audio': { testType: "audio", quizId: 2 },
        'audio-image': { testType: "audio-image", quizId: 3 },
        'spelling': { testType: "spelling", quizId: 4 }
      };

      const typeInfo = testTypeMap[testType] || testTypeMap['image'];

      const payload = {
        userId: user.id,
        lessonId: parseInt(lessonId),
        completedAt,
        learnedWords: score,
        testResults: [
          {
            testType: typeInfo.testType,
            score: scorePercentage,
            quizId: typeInfo.quizId
          }
        ]
      };

      try {
        let response = await fetch(`${API_CONFIG.BASE_URL}/api/UserProgress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          response = await fetch(`${API_CONFIG.BASE_URL}/api/UserProgress`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Error sending test results:', error);
        throw error;
      }
    };

    sendTestResults().catch(error => {
      console.error('Failed to save test results:', error);
    });
  }, [percentage, score, lessonId, testType]);

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

export default ResultsImageScreen;