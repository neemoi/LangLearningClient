import React, { useEffect } from 'react';
import API_CONFIG from '../../../../components/src/config';
import './../image/css/ImageTestPage.css';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const ResultsPronunciationScreen = ({ 
  score, 
  totalQuestions, 
  errors, 
  time, 
  wordStats, 
  startTest,
  lessonId,
  testType = "pronunciation"
}) => {
  const percentage = Math.round((score / Math.max(totalQuestions, 1)) * 100);
  const accuracy = Math.round(((totalQuestions - errors) / Math.max(totalQuestions, 1)) * 100);
  const wordsLearned = wordStats?.learnedWordsInLesson || score;
  const totalWords = wordStats?.totalWordsInLesson || totalQuestions;

  useEffect(() => {
    sendTestResults();
  }, []);

  const sendTestResults = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const user = JSON.parse(localStorage.getItem('currentUser'));
      
      if (!user?.id) {
        console.error('Пользователь не авторизован');
        return;
      }

      const parsedLessonId = parseInt(lessonId);
      if (isNaN(parsedLessonId)) {
        console.error('Некорректный ID урока:', lessonId);
        return;
      }

      const completedAt = new Date().toISOString();
      const quizId = getQuizId(testType);

      if (!quizId) {
        console.error('Некорректный тип теста:', testType);
        return;
      }

      const payload = {
        userId: user.id,
        lessonId: parsedLessonId,
        completedAt,
        learnedWords: Math.min(score, totalQuestions), 
        testResults: [
          {
            testType,
            score: percentage,
            quizId
          }
        ]
      };

      let response = await fetch(`${API_CONFIG.BASE_URL}/api/UserProgress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('POST не удался, пробуем PUT:', errorData);
        
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Ошибка сервера: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('Результаты успешно сохранены:', result);
      return result;

    } catch (error) {
      console.error('Ошибка при отправке результатов:', error);
    }
  };

  const getQuizId = (type) => {
    const types = {
      'image': 0,
      'audio': 0,
      'audio-image': 0,
      'spelling': 0,
      'pronunciation': 5
    };
    return types[type] || 0;
  };

  return (
    <div className="results-container">
      <div className="results-content">
        <header className="results-header">
          <h1 className="results-title">Результаты теста</h1>
          <p className="results-subtitle">Тест произношения завершен</p>
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

export default ResultsPronunciationScreen;