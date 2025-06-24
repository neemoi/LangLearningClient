import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../../components/layout/Sidebar/Sidebar';
import TestSidebar from './../image/TestSidebar';
import StartScreen from './../image/StartScreen';
import ResultsAdvancedTestScreen from './ResultsAdvancedTestScreen';
import API_CONFIG from '../../../../components/src/config';
import EmptyTestState from '../../Quizzes/audioImage/EmptyTestState';
import AdvancedTestScreen from './AdvancedTestScreen';

const TEST_TYPES = {
  IMAGE: 'image',
  AUDIO: 'audio',
  AUDIO_IMAGE: 'audio-image',
  SPELLING: 'spelling',
  GRAMMAR: 'grammar',
  PRONUNCIATION: 'pronunciation',
  ADVANCED: 'advanced-test'
};

const DEFAULT_QUIZ_DATA = {
  nouns: [
    {
      id: TEST_TYPES.IMAGE,
      icon: 'https://winner.gfriend.com/Content/images/vc-but04.png',
      tooltip: 'Изображение/Текст'
    },
    {
      id: TEST_TYPES.AUDIO,
      icon: 'https://winner.gfriend.com/Content/images/vc-but05.png',
      tooltip: 'Текст/Звукозапись'
    },
    {
      id: TEST_TYPES.AUDIO_IMAGE,
      icon: 'https://winner.gfriend.com/Content/images/vc-but06.png',
      tooltip: 'Изображение/Звукозапись'
    },
    {
      id: TEST_TYPES.SPELLING,
      icon: 'https://winner.gfriend.com/Content/images/vc-but07.png',
      tooltip: 'Правописание'
    },
    {
      id: TEST_TYPES.GRAMMAR,
      icon: 'https://winner.gfriend.com/Content/images/vc-but08.png',
      tooltip: 'Грамматика'
    },
    {
      id: TEST_TYPES.PRONUNCIATION,
      icon: 'https://winner.gfriend.com/Content/images/vc-but09.png',
      tooltip: 'Произношение'
    },
    {
      id: TEST_TYPES.ADVANCED,
      icon: 'https://winner.gfriend.com/Content/images/vc-but10.png',
      tooltip: 'Продвинутый тест'
    }
  ]
};

const Loader = () => (
  <div className="loader-container">
    <div className="loader-spinner"></div>
    <p>Загрузка теста...</p>
  </div>
);

const AdvancedTestPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30);
  const [timeExpired, setTimeExpired] = useState(false);
  const [testQuestions, setTestQuestions] = useState({
    [TEST_TYPES.IMAGE]: [],
    [TEST_TYPES.AUDIO]: [],
    [TEST_TYPES.AUDIO_IMAGE]: [],
    [TEST_TYPES.SPELLING]: [],
    [TEST_TYPES.GRAMMAR]: [],
    [TEST_TYPES.PRONUNCIATION]: [],
    [TEST_TYPES.ADVANCED]: []
  });
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [wordStats, setWordStats] = useState({
    totalWordsInLesson: 0,
    learnedWordsInLesson: 0,
    totalWordsOverall: 0,
    learnedWordsOverall: 0
  });
  const [testResults, setTestResults] = useState([]);

  const getAnswerClass = (answer) => {
    if (selectedAnswerId === null || timeExpired) return '';
    if (answer.id === selectedAnswerId) {
      return answer.isCorrect ? 'correct' : 'incorrect';
    }
    if (answer.isCorrect) return 'correct';
    return '';
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
    if (authStatus) fetchData();
  }, [navigate, lessonId]);

  useEffect(() => {
    let interval;
    if (timerActive) interval = setInterval(() => setTime(prev => prev + 1), 1000);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      const user = JSON.parse(localStorage.getItem('currentUser'));
      
      const [quizzesRes, wordStatsRes, progressRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/api/Lessons/${lessonId}/quizzes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/word-stats/${user.id}/${lessonId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/detailed/${user.id}/${lessonId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [quizzesData, wordStatsData, progressData] = await Promise.all([
        quizzesRes.json(),
        wordStatsRes.json(),
        progressRes.json()
      ]);

      setTestQuestions(processQuestions(quizzesData));
      setWordStats(wordStatsData);
      setTestResults(progressData.testResults || []);
      
      if (quizzesData?.length) {
        setShuffledQuestions([...processQuestions(quizzesData)[TEST_TYPES.ADVANCED]].sort(() => 0.5 - Math.random()));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processQuestions = (quizzesData) => {
    const result = {
      [TEST_TYPES.IMAGE]: [],
      [TEST_TYPES.AUDIO]: [],
      [TEST_TYPES.AUDIO_IMAGE]: [],
      [TEST_TYPES.SPELLING]: [],
      [TEST_TYPES.GRAMMAR]: [],
      [TEST_TYPES.PRONUNCIATION]: [],
      [TEST_TYPES.ADVANCED]: []
    };

    quizzesData.forEach(quiz => {
      quiz.questions?.forEach(question => {
        const qType = question.questionType?.toLowerCase();
        if (qType.includes('advanced')) {
          result[TEST_TYPES.ADVANCED].push(question);
        } else if (qType.includes('image') && qType.includes('audio')) {
          result[TEST_TYPES.AUDIO_IMAGE].push(question);
        } else if (qType.includes('image')) {
          result[TEST_TYPES.IMAGE].push(question);
        } else if (qType.includes('audio')) {
          result[TEST_TYPES.AUDIO].push(question);
        } else if (qType.includes('spelling')) {
          result[TEST_TYPES.SPELLING].push(question);
        } else if (qType.includes('grammar')) {
          result[TEST_TYPES.GRAMMAR].push(question);
        } else if (qType.includes('pronunciation')) {
          result[TEST_TYPES.PRONUNCIATION].push(question);
        }
      });
    });

    return result;
  };

  const startTest = () => {
    if (testQuestions[TEST_TYPES.ADVANCED].length === 0) {
      alert('Для этого урока нет вопросов продвинутого теста');
      return;
    }
    
    setTestStarted(true);
    setTimerActive(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setErrors(0);
    setTime(0);
    setShowResults(false);
    setSelectedAnswerId(null);
    setQuestionTimeLeft(30);
    setTimeExpired(false);
  };

  const handleTimeExpired = () => {
    setErrors(prev => prev + 1);
    setTimeout(goToNextQuestion, 2000);
  };

  const handleAnswerSelect = (answerId, isCorrect) => {
    if (selectedAnswerId !== null || timeExpired) return;
    
    setSelectedAnswerId(answerId);
    
    if (isCorrect) setScore(prev => prev + 1);
    else setErrors(prev => prev + 1);
    
    setTimeout(goToNextQuestion, 2000);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerId(null);
      setQuestionTimeLeft(30);
      setTimeExpired(false);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    setTimerActive(false);
    setShowResults(true);
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="test-page-wrapper">
        <Navigation onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
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

  if (testQuestions[TEST_TYPES.ADVANCED].length === 0 && !loading) {
    return (
      <div className="test-page-wrapper">
        <Navigation onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
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
      <Navigation onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
      
      <div className="content-wrapper">
        <Sidebar isOpen={sidebarOpen} />
        
        <div className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
          <div className={`test-container ${testStarted && !showResults ? 'test-active' : ''}`}>
            <div className="test-main-content">
              {!testStarted ? (
                <StartScreen 
                  testType={TEST_TYPES.ADVANCED}
                  totalQuestions={testQuestions[TEST_TYPES.ADVANCED].length}
                  quizData={DEFAULT_QUIZ_DATA}
                  startTest={startTest}
                />
              ) : showResults ? (
                <ResultsAdvancedTestScreen 
                  score={score}
                  totalQuestions={shuffledQuestions.length}
                  errors={errors}
                  time={time}
                  wordStats={wordStats}
                  startTest={startTest}
                  lessonId={lessonId}
                />
              ) : (
                <AdvancedTestScreen
                  currentQuestion={shuffledQuestions[currentQuestionIndex]}
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={shuffledQuestions.length}
                  questionTimeLeft={questionTimeLeft}
                  score={score}
                  errors={errors}
                  selectedAnswerId={selectedAnswerId}
                  timeExpired={timeExpired}
                  handleAnswerSelect={handleAnswerSelect}
                  getAnswerClass={getAnswerClass}
                  lessonId={lessonId}
                />
              )}
            </div>

            {(!testStarted || showResults) && (
              <TestSidebar
                testType={TEST_TYPES.ADVANCED}
                testStarted={testStarted}
                showResults={showResults}
                wordStats={wordStats}
                quizData={DEFAULT_QUIZ_DATA}
                testQuestions={testQuestions}
                navigate={navigate}
                lessonId={lessonId}
                testResults={testResults}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTestPage;