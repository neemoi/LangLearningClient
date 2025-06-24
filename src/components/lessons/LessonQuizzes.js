import React, { useState, useEffect } from 'react';
import './css/LessonQuizzes.css';

const LessonQuizzes = ({ startQuiz, lessonId }) => {
  const [hoveredQuiz, setHoveredQuiz] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    const fetchProgressData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentUser = localStorage.getItem('currentUser');
        const userToken = localStorage.getItem('userToken');

        if (!currentUser || !userToken) {
          throw new Error('Пользователь не авторизован');
        }

        const user = JSON.parse(currentUser);
        if (!user?.id) {
          throw new Error('Неверный формат данных пользователя');
        }

        const response = await fetch(
          `https://localhost:7119/api/UserProgress/detailed/${user.id}/${lessonId}`,
          {
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();
        setProgressData(data);
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [lessonId]);

  const quizData = {
    nouns: [
      { id: 'image', icon: 'https://winner.gfriend.com/Content/images/vc-but04.png', tooltip: 'Тест по изображениям' },
      { id: 'audio', icon: 'https://winner.gfriend.com/Content/images/vc-but05.png', tooltip: 'Тест по звукозаписи' },
      { id: 'audio-image', icon: 'https://winner.gfriend.com/Content/images/vc-but06.png', tooltip: 'Тест: звук + изображение' },
      { id: 'spelling', icon: 'https://winner.gfriend.com/Content/images/vc-but07.png', tooltip: 'Тест на правописание' }
    ],
    grammar: [
      { id: 'grammar', icon: 'https://winner.gfriend.com/Content/images/vc-but08.png', tooltip: 'Грамматический тест' },
      { id: 'pronunciation', icon: 'https://winner.gfriend.com/Content/images/vc-but09.png', tooltip: 'Тест на произношение' },
      { id: 'advanced', icon: 'https://winner.gfriend.com/Content/images/vc-but10.png', tooltip: 'Продвинутый тест' }
    ]
  };

  const getScoreForTest = (testType) => {
    if (!progressData?.testResults) return 0;
    
    const serverTestTypes = {
      'image': 'image',
      'audio': 'audio',
      'audio-image': 'audio-image',
      'spelling': 'spelling',
      'grammar': 'grammar',
      'pronunciation': 'pronunciation',
      'advanced': 'advanced-test'
    };

    const serverTestType = serverTestTypes[testType];
    const testResult = progressData.testResults.find(t => t.testType === serverTestType);
    
    if (!testResult) return 0;
    
    return testResult.score <= 1 ? Math.round(testResult.score * 100) : Math.round(testResult.score);
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="quiz-loading-spinner"></div>
        <p>Загрузка данных прогресса...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error">
        <p>Ошибка: {error}</p>
        <button 
          className="quiz-retry-btn"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-wrapper">
      <div className="quiz-columns">
        <div className="quiz-column">
          <div className="quiz-block">
            <h3 className="quiz-title">Существительные</h3>
            <div className="quiz-list">
              {quizData.nouns.map((quiz) => (
                <QuizItem
                  key={quiz.id}
                  quiz={quiz}
                  hoveredQuiz={hoveredQuiz}
                  setHoveredQuiz={setHoveredQuiz}
                  startQuiz={() => startQuiz(quiz.id)}
                  score={getScoreForTest(quiz.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="quiz-column">
          <div className="quiz-block">
            <h3 className="quiz-title">Грамматика</h3>
            <div className="quiz-list">
              {quizData.grammar.map((quiz) => (
                <QuizItem
                  key={quiz.id}
                  quiz={quiz}
                  hoveredQuiz={hoveredQuiz}
                  setHoveredQuiz={setHoveredQuiz}
                  startQuiz={() => startQuiz(quiz.id)}
                  score={getScoreForTest(quiz.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuizItem = ({ quiz, hoveredQuiz, setHoveredQuiz, startQuiz, score }) => {
  const getProgressColor = (score) => {
    if (score <= 30) return 'quiz-progress-red';
    if (score <= 70) return 'quiz-progress-yellow';
    return 'quiz-progress-green';
  };

  return (
    <div
      className={`quiz-item ${hoveredQuiz === quiz.id ? 'quiz-item-hovered' : ''}`}
      onClick={startQuiz}
      onMouseEnter={() => setHoveredQuiz(quiz.id)}
      onMouseLeave={() => setHoveredQuiz(null)}
    >
      <div className="quiz-icon-wrapper large">
        <img src={quiz.icon} alt={quiz.tooltip} className="quiz-icon" />
      </div>

      <div className="quiz-progress-bar-bg large">
        <div
          className={`quiz-progress-bar-fill ${getProgressColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="quiz-progress-text">{score}%</div>

      {hoveredQuiz === quiz.id && (
        <div className="quiz-tooltip">{quiz.tooltip}</div>
      )}
    </div>
  );
};

export default LessonQuizzes;