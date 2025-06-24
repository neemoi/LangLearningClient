import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/TestSidebar.css';

const TEST_TYPES = {
  IMAGE: 'image',
  AUDIO: 'audio',
  AUDIO_IMAGE: 'audio-image',
  SPELLING: 'spelling',
  GRAMMAR: 'grammar',
  PRONUNCIATION: 'pronunciation',
  ADVANCED: 'advanced-test'
};

const getTestPath = (quizId) => {
  const pathMap = {
    [TEST_TYPES.IMAGE]: 'image-test',
    [TEST_TYPES.AUDIO]: 'audio-test',
    [TEST_TYPES.AUDIO_IMAGE]: 'audio-image-test',
    [TEST_TYPES.SPELLING]: 'spelling-test',
    [TEST_TYPES.GRAMMAR]: 'grammar-test',
    [TEST_TYPES.PRONUNCIATION]: 'pronunciation-test',
    [TEST_TYPES.ADVANCED]: 'advanced-test'
  };
  return pathMap[quizId] || quizId;
};

const TestSidebar = ({
  testType,
  testStarted,
  showResults,
  wordStats,
  quizData,
  testQuestions = {},
  lessonId,
  testResults = [],
  navigate
}) => {
  const routerNavigate = useNavigate();

  const handleTestNavigation = useCallback((quizId) => {
    if (!lessonId || (testStarted && !showResults)) return;
    const path = getTestPath(quizId);
    const navFunction = navigate || routerNavigate;
    navFunction(`/lessonsVirtual/${lessonId}/${path}`);
  }, [lessonId, navigate, routerNavigate, testStarted, showResults]);

  const getTestScore = (quizId) => {
    const result = testResults.find(r => r.testType === quizId);
    if (!result) return 0;
    
    const score = result.score;
    return Math.round(score > 1 ? score : score * 100);
  };

  const progressStats = {
    lesson: Math.round(((wordStats?.learnedWordsInLesson || 0) / (wordStats?.totalWordsInLesson || 1)) * 100),
    course: Math.round(((wordStats?.learnedWordsOverall || 0) / (wordStats?.totalWordsOverall || 1)) * 100)
  };

  return (
    <div className="progress-sidebar">
      <div className="progress-section">
        <h3 className="progress-header">Ваш прогресс</h3>
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
                style={{ width: `${progressStats.lesson}%` }}
              />
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
                style={{ width: `${progressStats.course}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="tests-section">
        <h3 className="tests-header">Доступные тесты</h3>
        <div className="test-cards">
          {quizData?.nouns?.map((quiz) => {
            const questionsCount = testQuestions[quiz.id]?.length || 0;
            const isActive = testType === quiz.id;
            const isDisabled = questionsCount === 0 || (testStarted && !showResults);
            const score = getTestScore(quiz.id);

            return (
              <div
                key={quiz.id}
                className={`test-card ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && handleTestNavigation(quiz.id)}
                title={isDisabled ? 'Тест недоступен' : quiz.tooltip}
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
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="test-progress-value">{score}%</span>
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