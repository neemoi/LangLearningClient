import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import API_CONFIG from '../../../components/src/config';
import ActiveTestScreen from './ActiveTestScreen';
import ResultsScreen from './ResultsScreen';
import StartScreen from './StartScreen';
import TestSidebar from './TestSidebar';
import './ImageTestPage.css';

const Loader = () => (
  <div className="loader-container">
    <div className="loader-spinner"></div>
    <p>Загрузка теста...</p>
  </div>
);

const EmptyTestState = ({ testQuestions, lessonId, navigate }) => (
  <div className="empty-test-container">
    <div className="empty-test-card">
      <div className="empty-test-icon">📭</div>
      <h2>Тест временно недоступен</h2>
      <p>Для этого теста пока нет вопросов.</p>
      
      <div className="test-stats-grid">
        <div className="test-stat-card">
          <div className="stat-icon">🖼️</div>
          <div className="stat-count">{testQuestions.image.length}</div>
          <div className="stat-name">Изображения</div>
        </div>
        <div className="test-stat-card">
          <div className="stat-icon">🔊</div>
          <div className="stat-count">{testQuestions.audio.length}</div>
          <div className="stat-name">Аудио</div>
        </div>
        <div className="test-stat-card">
          <div className="stat-icon">🎬</div>
          <div className="stat-count">{testQuestions['audio-image'].length}</div>
          <div className="stat-name">Аудио+Изображение</div>
        </div>
        <div className="test-stat-card">
          <div className="stat-icon">✍️</div>
          <div className="stat-count">{testQuestions.spelling.length}</div>
          <div className="stat-name">Правописание</div>
        </div>
      </div>
      
      <button 
        className="return-btn" 
        onClick={() => navigate(`/lessonsVirtual/${lessonId}`)}
      >
        Вернуться к уроку
      </button>
    </div>
  </div>
);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const TestPage = () => {
  const { lessonId, testType = 'image' } = useParams();
  const navigate = useNavigate();
  
  const [hoveredCard, setHoveredCard] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(12);
  const [timeExpired, setTimeExpired] = useState(false);
  
  const [testQuestions, setTestQuestions] = useState({
    image: [], audio: [], 'audio-image': [], spelling: []
  });
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [allWords, setAllWords] = useState([]);
  const [lessonWords, setLessonWords] = useState([]);
  const [bestResults, setBestResults] = useState({ score: 0, time: 0 });
  const [detailedProgress, setDetailedProgress] = useState(null);
  const [quizProgress, setQuizProgress] = useState({
    image: 0, audio: 0, 'audio-image': 0, spelling: 0
  });
  const [wordStats, setWordStats] = useState({
    totalWordsInLesson: 0,
    learnedWordsInLesson: 0,
    totalWordsOverall: 0,
    learnedWordsOverall: 0
  });

  const quizData = {
    nouns: [
      { id: 'image', icon: 'https://winner.gfriend.com/Content/images/vc-but04.png', tooltip: 'по изображениям' },
      { id: 'audio', icon: 'https://winner.gfriend.com/Content/images/vc-but05.png', tooltip: 'по звукозаписи' },
      { id: 'audio-image', icon: 'https://winner.gfriend.com/Content/images/vc-but06.png', tooltip: 'звук + изображение' },
      { id: 'spelling', icon: 'https://winner.gfriend.com/Content/images/vc-but07.png', tooltip: 'на правописание' }
    ]
  };

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = localStorage.getItem('currentUser');
      const userToken = localStorage.getItem('userToken');
      
      if (!currentUser || !userToken) {
        navigate('/');
        return false;
      }
      return true;
    };

    const authStatus = checkAuth();
    setIsAuthenticated(authStatus);
    
    if (authStatus) {
      fetchData();
    }
  }, [navigate, lessonId]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateToTest = (testId) => {
    navigate(`/lessonsVirtual/${lessonId}/test/${testId}`);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      const user = JSON.parse(localStorage.getItem('currentUser'));
      
      const [allWordsRes, lessonWordsRes, quizzesRes, progressRes, wordStatsRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/api/Words`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/Lessons/${lessonId}/words`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/Lessons/${lessonId}/quizzes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/detailed/${user.id}/${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/word-stats/${user.id}/${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if ([allWordsRes, lessonWordsRes, quizzesRes, progressRes, wordStatsRes].some(res => res.status === 401)) {
        handleUnauthorized();
        return;
      }

      const [allWordsData, lessonWordsData, quizzesData, progressData, wordStatsData] = await Promise.all([
        allWordsRes.json(),
        lessonWordsRes.json(),
        quizzesRes.json(),
        progressRes.json(),
        wordStatsRes.json()
      ]);
      
      setAllWords(allWordsData);
      setLessonWords(lessonWordsData);
      setTestQuestions(processQuestions(quizzesData, allWordsData));
      setDetailedProgress(progressData);
      setWordStats(wordStatsData);
      
      const quizTypes = ['image', 'audio', 'audio-image', 'spelling'];
      const progressMap = {};
      quizTypes.forEach(type => {
        const quizId = getQuestionType(type);
        const quiz = progressData.quizzes?.find(q => q.quizId === quizId);
        const progress = quiz ? Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100) : 0;
        progressMap[type] = isNaN(progress) ? 0 : progress;
      });
      setQuizProgress(progressMap);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userToken');
    navigate('/');
  };

  useEffect(() => {
    if (testQuestions[testType]?.length) {
      setShuffledQuestions([...testQuestions[testType]].sort(() => 0.5 - Math.random()));
    }
  }, [testType, testQuestions]);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    let questionTimer;
    if (testStarted && !showResults && questionTimeLeft > 0) {
      questionTimer = setInterval(() => setQuestionTimeLeft(prev => prev - 1), 1000);
    } else if (questionTimeLeft === 0 && !timeExpired) {
      setTimeExpired(true);
      handleTimeExpired();
    }
    return () => clearInterval(questionTimer);
  }, [testStarted, showResults, questionTimeLeft, timeExpired]);

  useEffect(() => {
    if (testStarted) {
      setQuestionTimeLeft(12);
      setTimeExpired(false);
    }
  }, [currentQuestionIndex, testStarted]);

  const processQuestions = (quizzesData, wordsData) => {
    const result = { image: [], audio: [], 'audio-image': [], spelling: [] };

    quizzesData.forEach(quiz => {
      quiz.questions?.forEach(question => {
        const processedQuestion = {
          ...question,
          options: generateOptions(question.correctAnswer, wordsData, 4)
        };

        const qType = question.questionType.toLowerCase();
        if (qType.includes('image') && !qType.includes('audio')) {
          result.image.push(processedQuestion);
        } else if (qType.includes('audio') && !qType.includes('image')) {
          result.audio.push(processedQuestion);
        } else if (qType.includes('audio') && qType.includes('image')) {
          result['audio-image'].push(processedQuestion);
        } else if (qType.includes('spelling')) {
          result.spelling.push(processedQuestion);
        }
      });
    });

    return result;
  };

  const generateOptions = (correctAnswer, wordsData, count = 4) => {
    if (!wordsData?.length) return [correctAnswer];
    
    const otherWords = wordsData
      .filter(word => word.name.toLowerCase() !== correctAnswer.toLowerCase())
      .map(word => word.name);
    
    const randomWords = [...otherWords]
      .sort(() => 0.5 - Math.random())
      .slice(0, count - 1);
    
    return [...randomWords, correctAnswer].sort(() => 0.5 - Math.random());
  };

  const currentTestQuestions = shuffledQuestions;
  const totalQuestions = currentTestQuestions.length;
  const currentQuestion = currentTestQuestions[currentQuestionIndex] || {};

  const getQuestionType = (type) => {
    switch(type) {
      case 'image': return 1;
      case 'audio': return 2;
      case 'audio-image': return 3;
      case 'spelling': return 4;
      default: return 0;
    }
  };

  const sendProgress = async (isCorrect) => {
    try {
      const token = localStorage.getItem('userToken');
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user?.id) {
        handleUnauthorized();
        return { success: false, message: 'User not authenticated' };
      }

      const word = allWords.find(w => 
        w.name.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
      );
      
      const lessonWord = lessonWords.find(lw => lw.wordId === word.id);
      
      const payload = {
        userId: user.id,
        lessonId: parseInt(lessonId),
        wordId: word.id,
        questionType: getQuestionType(testType),
        isCorrect,
        lessonWordId: lessonWord?.id || 0
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/word-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        handleUnauthorized();
        return { success: false, message: 'Unauthorized' };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('Error sending progress:', error);
      return { success: false, error };
    }
  };

  const sendTestResults = async () => {
    const token = localStorage.getItem('userToken');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user?.id) {
      handleUnauthorized();
      return { success: false, message: 'User not authenticated' };
    }

    const completedAt = new Date().toISOString();
    const scorePercentage = Math.round((score / totalQuestions) * 100);

    const payload = {
      userId: user.id,
      lessonId: parseInt(lessonId),
      quizId: getQuestionType(testType),
      score: scorePercentage,
      completedAt,
      learnedWords: score 
    };

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/UserProgress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        handleUnauthorized();
        return { success: false, message: 'Unauthorized' };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending test results:', error);
      return { success: false, error };
    }
  };

  const startTest = () => {
    if (totalQuestions === 0) {
      alert(`Нет вопросов для теста. Доступно:
      Изображения: ${testQuestions.image.length}
      Аудио: ${testQuestions.audio.length}
      Аудио+Изображение: ${testQuestions['audio-image'].length}
      Правописание: ${testQuestions.spelling.length}`);
      return;
    }
    
    setShuffledQuestions([...shuffledQuestions].sort(() => 0.5 - Math.random()));
    setTestStarted(true);
    setTimerActive(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setErrors(0);
    setTime(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setQuestionTimeLeft(12);
    setTimeExpired(false);
  };

  const handleTimeExpired = async () => {
    setErrors(errors + 1);
    await sendProgress(false);
    setTimeout(goToNextQuestion, 2000);
  };

  const handleAnswerSelect = async (answer) => {
    if (!currentQuestion || timeExpired) return;
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    setSelectedAnswer(answer);
    
    if (isCorrect) {
      setScore(score + 1);
    } else {
      setErrors(errors + 1);
    }
    
    await sendProgress(isCorrect);
    setTimeout(goToNextQuestion, 2000);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    setTimerActive(false);
    setShowResults(true);
    
    const currentScore = Math.round((score / totalQuestions) * 100);
    const isNewRecord = currentScore > bestResults.score || 
                      (currentScore === bestResults.score && time < bestResults.time);
    
    if (isNewRecord) {
      setBestResults({ score: currentScore, time });
    }

    try {
      await sendTestResults();
      
      const token = localStorage.getItem('userToken');
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user?.id) {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/word-stats/${user.id}/${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const updatedStats = await response.json();
        setWordStats(updatedStats);
      }
    } catch (error) {
      console.error('Error finishing test:', error);
    }
  };

  const getOptionClass = (option) => {
    if (!selectedAnswer && !timeExpired) return "option-btn";
    
    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === selectedAnswer;
    
    if (timeExpired && isCorrect) return "option-btn correct-highlight";
    if (isCorrect && (selectedAnswer || timeExpired)) return "option-btn correct";
    if (isSelected && !isCorrect) return "option-btn incorrect";
    return "option-btn";
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="test-page-wrapper">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="content-wrapper">
          <Sidebar isOpen={sidebarOpen} />
          <div className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
            <div className="test-container loading-state">
              <Loader />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (totalQuestions === 0 && !loading) {
    return (
      <div className="test-page-wrapper">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="content-wrapper">
          <Sidebar isOpen={sidebarOpen} />
          <div className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
            <div className="test-container empty-state">
              <EmptyTestState 
                testQuestions={testQuestions} 
                lessonId={lessonId} 
                navigate={navigate} 
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="test-page-wrapper">
      <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      
      <div className="content-wrapper">
        <Sidebar isOpen={sidebarOpen} />
        
        <div className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
          <div className={`test-container ${testStarted && !showResults ? 'test-active' : ''}`}>
            <div className="test-main-content">
              {!testStarted ? (
                <StartScreen 
                  testType={testType}
                  totalQuestions={totalQuestions}
                  quizData={quizData}
                  startTest={startTest}
                />
              ) : showResults ? (
                <ResultsScreen 
                  score={score}
                  totalQuestions={totalQuestions}
                  errors={errors}
                  time={time}
                  wordStats={wordStats}
                  startTest={startTest}
                />
              ) : (
                <ActiveTestScreen
                  testType={testType}
                  currentQuestion={currentQuestion}
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={totalQuestions}
                  questionTimeLeft={questionTimeLeft}
                  score={score}
                  errors={errors}
                  selectedAnswer={selectedAnswer}
                  timeExpired={timeExpired}
                  handleAnswerSelect={handleAnswerSelect}
                  getOptionClass={getOptionClass}
                />
              )}
            </div>

            {(!testStarted || showResults) && (
              <TestSidebar
                testType={testType}
                testStarted={testStarted}
                showResults={showResults}
                wordStats={wordStats}
                quizData={quizData}
                testQuestions={testQuestions}
                hoveredCard={hoveredCard}
                setHoveredCard={setHoveredCard}
                navigateToTest={navigateToTest}
                lessonId={lessonId} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;