import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ImageTestPage.css';

const TestSidebar = ({
  testType,
  testStarted,
  showResults,
  wordStats,
  quizData,
  testQuestions,
  hoveredCard,
  setHoveredCard,
  navigateToTest,
  lessonId
}) => {
  const navigate = useNavigate();

  const getTestPath = (quizId) => {
    const pathMap = {
      'image': 'image-test',
      'audio': 'audio-test',
      'audio-image': 'audio-image-test',
      'spelling': 'spelling-test'
    };
    return pathMap[quizId] || `${quizId}-test`;
  };

  const handleTestNavigation = (quizId) => {
    if (!lessonId) return;
    if (testQuestions?.[quizId]?.length === 0) return;
    
    const testPath = getTestPath(quizId);
    navigate(`/lessonsVirtual/${lessonId}/${testPath}`);
  };

  if (!lessonId) {
    return (
      <div className="progress-sidebar error">
        <div className="error-message">
          Ошибка: не удалось загрузить информацию об уроке
        </div>
      </div>
    );
  }

  return (
    <div className="progress-sidebar">
      <div className="progress-section">
        <h3 className="progress-header">
          Ваш прогресс
        </h3>
        
        <div className="progress-cards">
          <div className="progress-card">
            <div className="progress-info">
              <span className="progress-label">Урок</span>
              <span className="progress-count">
                {wordStats?.learnedWordsInLesson || 0} из {wordStats?.totalWordsInLesson || 0} слов
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill lesson-fill"
                style={{
                  width: `${Math.round(((wordStats?.learnedWordsInLesson || 0) / (wordStats?.totalWordsInLesson || 1)) * 100)}%` 
                }}
              ></div>
            </div>
          </div>

          <div className="progress-card">
            <div className="progress-info">
              <span className="progress-label">Курс</span>
              <span className="progress-count">
                {wordStats?.learnedWordsOverall || 0} из {wordStats?.totalWordsOverall || 0} слов
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill course-fill"
                style={{
                  width: `${Math.round(((wordStats?.learnedWordsOverall || 0) / (wordStats?.totalWordsOverall || 1)) * 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="tests-section">
        <h3 className="tests-header">
          Другие тесты
        </h3>
        
        <div className="test-cards">
          {quizData?.nouns?.map((quiz) => {
            const questionsCount = testQuestions?.[quiz.id]?.length || 0;
            const progress = questionsCount 
              ? Math.round((wordStats?.learnedWordsInLesson || 0) / questionsCount * 100)
              : 0;
              
            return (
              <div 
                key={quiz.id}
                className={`test-card ${testType === quiz.id ? 'active' : ''} ${questionsCount === 0 ? 'disabled' : ''}`}
                onClick={() => handleTestNavigation(quiz.id)}
                onMouseEnter={() => setHoveredCard(quiz.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="test-icon">
                  <img src={quiz.icon} alt={quiz.tooltip} />
                  {questionsCount > 0 && (
                    <span className="test-badge">{questionsCount}</span>
                  )}
                </div>
                <div className="test-details">
                  <span className="test-title">{quiz.tooltip}</span>
                  <div className="test-progress">
                    <div className="test-progress-bar">
                      <div 
                        className="test-progress-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="test-progress-value">{progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestSidebar;