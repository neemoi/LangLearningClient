import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../../../../components/src/config';
import './css/TestSidebar.css';

const TestSidebar = ({ 
  testType, 
  testStarted, 
  showResults, 
  wordStats, 
  quizData, 
  testQuestions, 
  lessonId, 
  testResults = [] 
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [detailedResults, setDetailedResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetailedResults = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user?.id) return;

        const response = await fetch(
          `${API_CONFIG.BASE_URL}/api/UserProgress/detailed/${user.id}/${lessonId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (response.ok) {
          const data = await response.json();
          setDetailedResults(data);
        }
      } catch (error) {
        console.error('Error fetching detailed results:', error);
      }
    };

    if (lessonId) {
      fetchDetailedResults();
    }
  }, [lessonId, showResults]);

  const getTestPath = (quizId) => {
    const pathMap = {
      'image': 'image-test',
      'audio': 'audio-test',
      'audio-image': 'audio-image-test',
      'spelling': 'spelling-test',
      'grammar': 'grammar-test'
    };
    return pathMap[quizId] || `${quizId}-test`;
  };

  const handleTestNavigation = (quizId) => {
    if (!lessonId) return;
    if (testQuestions?.[quizId]?.length === 0) return;
    const testPath = getTestPath(quizId);
    navigate(`/lessonsVirtual/${lessonId}/${testPath}`);
  };

  const getTestScore = (quizId) => {
    const localResult = testResults.find(result => result.testType === quizId);
    if (localResult) return localResult.score;

    if (detailedResults?.testResults) {
      const apiResult = detailedResults.testResults.find(result => result.testType === quizId);
      return apiResult?.score || 0;
    }
    return 0;
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

const allTests = [
  ...(quizData?.nouns || []),
  ...(quizData?.grammar || []),
  ...(quizData?.tests || []),
  ...(quizData?.all || [])
];

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
        <h3 className="tests-header">Тесты</h3>
        <div className="test-cards">
          {allTests.map((quiz) => {
            const questionsCount = testQuestions?.[quiz.id]?.length || 0;
            const testScore = getTestScore(quiz.id);
            
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
                        style={{ width: `${testScore}%` }}
                      ></div>
                    </div>
                    <span className="test-progress-value">{testScore}%</span>
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