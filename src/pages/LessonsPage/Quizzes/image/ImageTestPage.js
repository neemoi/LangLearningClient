import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../../components/layout/Sidebar/Sidebar';
import API_CONFIG from '../../../../components/src/config';
import ActiveTestScreen from './ActiveTestScreen';
import ResultsTestScreen from './ResultsImageScreen';
import StartScreen from './StartScreen';
import EmptyTestState from './../audioImage/EmptyTestState';
import TestSidebar from './TestSidebar';
import './css/ImageTestPage.css';

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

const ImageTestPage = () => {
  const { lessonId, testType = TEST_TYPES.IMAGE } = useParams();
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
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(12);
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
  const [allWords, setAllWords] = useState([]);
  const [lessonWords, setLessonWords] = useState([]);
  const [wordStats, setWordStats] = useState({
    totalWordsInLesson: 0,
    learnedWordsInLesson: 0,
    totalWordsOverall: 0,
    learnedWordsOverall: 0
  });
  const [detailedProgress, setDetailedProgress] = useState(null);

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
    if (timerActive) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    let questionInterval;
    if (testStarted && !showResults && questionTimeLeft > 0) {
      questionInterval = setInterval(() => {
        setQuestionTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (questionTimeLeft === 0 && !timeExpired) {
      setTimeExpired(true);
      handleTimeExpired();
    }
    return () => clearInterval(questionInterval);
  }, [testStarted, showResults, questionTimeLeft, timeExpired]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      const user = JSON.parse(localStorage.getItem('currentUser'));
      
      const [allWordsRes, lessonWordsRes, quizzesRes, progressRes, wordStatsRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/api/Words`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/Lessons/${lessonId}/words`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/Lessons/${lessonId}/quizzes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/detailed/${user.id}/${lessonId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/word-stats/${user.id}/${lessonId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [allWordsData, lessonWordsData, quizzesData, progressData, wordStatsData] = await Promise.all([
        allWordsRes.json(),
        lessonWordsRes.json(),
        quizzesRes.json(),
        progressRes.json(),
        wordStatsRes.json()
      ]);
      
      setAllWords(Array.isArray(allWordsData) ? allWordsData : []);
      setLessonWords(Array.isArray(lessonWordsData) ? lessonWordsData : []);
      setTestQuestions(processQuestions(quizzesData, allWordsData));
      setDetailedProgress(progressData || null);
      setWordStats(wordStatsData || {
        totalWordsInLesson: 0,
        learnedWordsInLesson: 0,
        totalWordsOverall: 0,
        learnedWordsOverall: 0
      });
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const processQuestions = (quizzesData, wordsData) => {
    const result = {
      [TEST_TYPES.IMAGE]: [],
      [TEST_TYPES.AUDIO]: [],
      [TEST_TYPES.AUDIO_IMAGE]: [],
      [TEST_TYPES.SPELLING]: [],
      [TEST_TYPES.GRAMMAR]: [],
      [TEST_TYPES.PRONUNCIATION]: [],
      [TEST_TYPES.ADVANCED]: []
    };

    if (!Array.isArray(quizzesData)) {
      console.error('quizzesData не является массивом:', quizzesData);
      return result;
    }

    quizzesData.forEach(quiz => {
      if (quiz.questions && Array.isArray(quiz.questions)) {
        quiz.questions.forEach(question => {
          const processedQuestion = {
            ...question,
            options: generateOptions(question.correctAnswer, wordsData, 4)
          };

          const qType = (question.questionType || '').toLowerCase();
          
          if (qType.includes('image') && !qType.includes('audio')) {
            result[TEST_TYPES.IMAGE].push(processedQuestion);
          } else if (qType.includes('audio') && !qType.includes('image')) {
            result[TEST_TYPES.AUDIO].push(processedQuestion);
          } else if (qType.includes('audio') && qType.includes('image')) {
            result[TEST_TYPES.AUDIO_IMAGE].push(processedQuestion);
          } else if (qType.includes('spelling')) {
            result[TEST_TYPES.SPELLING].push(processedQuestion);
          } else if (qType.includes('grammar')) {
            result[TEST_TYPES.GRAMMAR].push(processedQuestion);
          } else if (qType.includes('pronunciation')) {
            result[TEST_TYPES.PRONUNCIATION].push(processedQuestion);
          } else if (qType.includes('advanced')) {
            result[TEST_TYPES.ADVANCED].push(processedQuestion);
          }
        });
      }
    });

    return result;
  };

  const generateOptions = (correctAnswer, wordsData, count = 4) => {
    if (!Array.isArray(wordsData) || wordsData.length === 0 || !correctAnswer) {
      return [correctAnswer].filter(Boolean);
    }
    
    const otherWords = wordsData
      .filter(word => word?.name?.toLowerCase() !== correctAnswer?.toLowerCase())
      .map(word => word.name)
      .filter(Boolean);
    
    const randomWords = [...otherWords]
      .sort(() => 0.5 - Math.random())
      .slice(0, count - 1);
    
    return [...randomWords, correctAnswer].sort(() => 0.5 - Math.random());
  };

  const startTest = () => {
    if (testQuestions[testType].length === 0) {
      alert(`Нет вопросов для теста "${testType}". Доступно:
      Изображения: ${testQuestions.image.length}
      Аудио: ${testQuestions.audio.length}
      Аудио+Изображение: ${testQuestions['audio-image'].length}
      Правописание: ${testQuestions.spelling.length}
      Грамматика: ${testQuestions.grammar.length}
      Произношение: ${testQuestions.pronunciation.length}
      Продвинутый тест: ${testQuestions['advanced-test'].length}`);
      return;
    }
    
    setShuffledQuestions([...testQuestions[testType]].sort(() => 0.5 - Math.random()));
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
    const newErrors = errors + 1;
    setErrors(newErrors);
    await sendProgress(false);
    setTimeout(goToNextQuestion, 2000);
  };

  const handleAnswerSelect = async (answer) => {
    if (!shuffledQuestions[currentQuestionIndex] || timeExpired) return;
    
    const isCorrect = answer === shuffledQuestions[currentQuestionIndex].correctAnswer;
    setSelectedAnswer(answer);
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    } else {
      setErrors(prevErrors => prevErrors + 1);
    }
    
    await sendProgress(isCorrect);
    setTimeout(goToNextQuestion, 2000);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setQuestionTimeLeft(12);
      setTimeExpired(false);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    setTimerActive(false);
    setShowResults(true);
  };

  const sendProgress = async (isCorrect) => {
    try {
      const token = localStorage.getItem('userToken');
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user?.id) {
        handleUnauthorized();
        return;
      }

      const currentQuestion = shuffledQuestions[currentQuestionIndex];
      const word = allWords.find(w => 
        w.name?.toLowerCase() === currentQuestion?.correctAnswer?.toLowerCase()
      );
      
      const lessonWord = lessonWords.find(lw => lw.wordId === word?.id);
      
      const payload = {
        userId: user.id,
        lessonId: parseInt(lessonId),
        wordId: word?.id || 0,
        questionType: getQuestionTypeId(testType),
        isCorrect,
        lessonWordId: lessonWord?.id || 0
      };

      await fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/word-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Ошибка при отправке прогресса:', error);
    }
  };

  const getQuestionTypeId = (type) => {
    switch(type) {
      case TEST_TYPES.IMAGE: return 1;
      case TEST_TYPES.AUDIO: return 2;
      case TEST_TYPES.AUDIO_IMAGE: return 3;
      case TEST_TYPES.SPELLING: return 4;
      case TEST_TYPES.GRAMMAR: return 5;
      case TEST_TYPES.PRONUNCIATION: return 6;
      case TEST_TYPES.ADVANCED: return 7;
      default: return 0;
    }
  };

  const getOptionClass = (option) => {
    if (!selectedAnswer && !timeExpired) return "option-btn";
    
    const isCorrect = option === shuffledQuestions[currentQuestionIndex]?.correctAnswer;
    const isSelected = option === selectedAnswer;
    
    if (timeExpired && isCorrect) return "option-btn correct-highlight";
    if (isCorrect && (selectedAnswer || timeExpired)) return "option-btn correct";
    if (isSelected && !isCorrect) return "option-btn incorrect";
    return "option-btn";
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateToTest = (testId) => {
    navigate(`/lessonsVirtual/${lessonId}/${testId}`);
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userToken');
    navigate('/');
  };

  const currentQuestion = shuffledQuestions[currentQuestionIndex] || {};
  const totalQuestions = shuffledQuestions.length;

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

  if (testQuestions[testType].length === 0 && !loading) {
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
                  totalQuestions={testQuestions[testType].length}
                  quizData={DEFAULT_QUIZ_DATA}
                  startTest={startTest}
                />
              ) : showResults ? (
                <ResultsTestScreen
                  score={score}
                  totalQuestions={shuffledQuestions.length}
                  errors={errors}
                  time={time}
                  wordStats={wordStats}
                  startTest={startTest}
                  lessonId={lessonId}
                  testType={testType}
                />
              ) : (
                <ActiveTestScreen
                  testType={testType}
                  currentQuestion={currentQuestion}
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={shuffledQuestions.length}
                  questionTimeLeft={questionTimeLeft}
                  score={score}
                  errors={errors}
                  selectedAnswer={selectedAnswer}
                  timeExpired={timeExpired}
                  handleAnswerSelect={handleAnswerSelect}
                  getOptionClass={getOptionClass}
                  lessonId={lessonId}
                  lessonTitle="Текущий урок" 
                />
              )}
            </div>

            {(!testStarted || showResults) && (
              <TestSidebar
                testType={testType}
                testStarted={testStarted}
                showResults={showResults}
                wordStats={wordStats}
                testResults={detailedProgress?.testResults || []}
                quizData={DEFAULT_QUIZ_DATA}
                testQuestions={testQuestions}
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

export default ImageTestPage;