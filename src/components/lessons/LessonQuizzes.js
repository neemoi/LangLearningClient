import React, { useState, useEffect } from 'react';
import './css/LessonQuizzes.css';
import API_CONFIG from '../../components/src/config';

const LessonQuizzes = ({ startQuiz, lessonId }) => {
  const [hoveredQuiz, setHoveredQuiz] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setProgressData(null); 
      
      const currentUser = localStorage.getItem('currentUser');
      const userToken = localStorage.getItem('userToken');

      if (!currentUser || !userToken || !lessonId) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(currentUser);
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/UserProgress/detailed/${user.id}/${lessonId}`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();
      setProgressData(data);
    } catch (err) {
      console.error('Error fetching progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      <div className="knowledge-loader">
        <div className="knowledge-spinner"></div>
        <p>Загрузка данных прогресса...</p>
      </div>
    );
  }

  return (
    <div className="knowledge-container">
      <div className="knowledge-sections">
        <div className="knowledge-section">
          <div className="knowledge-card">
            <h3 className="knowledge-heading">Существительные</h3>
            <div className="knowledge-items">
              {quizData.nouns.map((quiz) => (
                <KnowledgeItem
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

        <div className="knowledge-section">
          <div className="knowledge-card">
            <h3 className="knowledge-heading">Грамматика</h3>
            <div className="knowledge-items">
              {quizData.grammar.map((quiz) => (
                <KnowledgeItem
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

const KnowledgeItem = ({ quiz, hoveredQuiz, setHoveredQuiz, startQuiz, score }) => {
  const getProgressColor = (score) => {
    if (score <= 30) return 'knowledge-meter-red';
    if (score <= 70) return 'knowledge-meter-yellow';
    return 'knowledge-meter-green';
  };

  return (
    <div
      className={`knowledge-unit ${hoveredQuiz === quiz.id ? 'knowledge-unit-active' : ''}`}
      onClick={startQuiz}
      onMouseEnter={() => setHoveredQuiz(quiz.id)}
      onMouseLeave={() => setHoveredQuiz(null)}
    >
      <div className="knowledge-icon-holder big">
        <img src={quiz.icon} alt={quiz.tooltip} className="knowledge-icon" />
      </div>

      <div className="knowledge-meter-bg big">
        <div
          className={`knowledge-meter-fill ${getProgressColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="knowledge-score">{score}%</div>

      {hoveredQuiz === quiz.id && (
        <div className="knowledge-hint">{quiz.tooltip}</div>
      )}
    </div>
  );
};

export default LessonQuizzes;