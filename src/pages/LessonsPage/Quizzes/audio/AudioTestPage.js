import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../../components/layout/Sidebar/Sidebar';
import TestSidebar from '../image/TestSidebar';
import StartScreen from '../image/StartScreen';
import ActiveTestScreen from '../image/ActiveTestScreen';
import ResultsTestScreen from '../audio/ResultsAudioScreen';
import EmptyTestState from '../audioImage/EmptyTestState';
import API_CONFIG from '../../../../components/src/config';
import './css/AudioTestPage.css';

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

const AudioTestPage = () => {
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
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(15);
  const [timeExpired, setTimeExpired] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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
      setTestQuestions(processQuestions(quizzesData, allWordsData, lessonWordsData));
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

  const processQuestions = (quizzesData, wordsData, lessonWordsData) => {
    const result = {
      [TEST_TYPES.IMAGE]: [],
      [TEST_TYPES.AUDIO]: [],
      [TEST_TYPES.AUDIO_IMAGE]: [],
      [TEST_TYPES.SPELLING]: [],
      [TEST_TYPES.GRAMMAR]: [],
      [TEST_TYPES.PRONUNCIATION]: [],
      [TEST_TYPES.ADVANCED]: []
    };

    const wordsDict = wordsData.reduce((acc, word) => {
      acc[word.name.toLowerCase()] = word;
      return acc;
    }, {});

    const lessonWordsDict = lessonWordsData.reduce((acc, lw) => {
      acc[lw.wordId] = lw;
      return acc;
    }, {});

    quizzesData.forEach(quiz => {
      quiz.questions?.forEach(question => {
        const normalizedAnswer = question.correctAnswer?.toLowerCase().trim();
        const word = wordsDict[normalizedAnswer];
        const lessonWord = word ? lessonWordsDict[word.id] : null;

        const processedQuestion = {
          ...question,
          wordId: word?.id,
          lessonWordId: lessonWord?.id || 0,
          options: generateOptions(question.correctAnswer, wordsData, 4)
        };

        const qType = question.questionType?.toLowerCase();
        if (qType.includes('audio') && qType.includes('image')) {
          result[TEST_TYPES.AUDIO_IMAGE].push(processedQuestion);
        } else if (qType.includes('audio')) {
          result[TEST_TYPES.AUDIO].push(processedQuestion);
        } else if (qType.includes('image')) {
          result[TEST_TYPES.IMAGE].push(processedQuestion);
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
    });

    return result;
  };

  const generateOptions = (correctAnswer, wordsData, count = 4) => {
    if (!wordsData?.length) return [correctAnswer];
    
    const otherWords = wordsData
      .filter(word => word.name.toLowerCase() !== correctAnswer?.toLowerCase())
      .map(word => word.name);
    
    const randomWords = [...otherWords]
      .sort(() => 0.5 - Math.random())
      .slice(0, count - 1);
    
    return [...randomWords, correctAnswer].sort(() => 0.5 - Math.random());
  };

  useEffect(() => {
    if (testQuestions[TEST_TYPES.AUDIO]?.length) {
      setShuffledQuestions([...testQuestions[TEST_TYPES.AUDIO]].sort(() => 0.5 - Math.random()));
    }
  }, [testQuestions]);

  const playAudio = useCallback(() => {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    if (!currentQuestion?.audioUrl) return;
    
    const audio = new Audio(currentQuestion.audioUrl);
    audio.play().catch(e => console.error('Error playing audio:', e));
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
  }, [currentQuestionIndex, shuffledQuestions]);

  const sendProgress = useCallback(async (isCorrect) => {
    try {
      const token = localStorage.getItem('userToken');
      const user = JSON.parse(localStorage.getItem('currentUser'));
      
      const currentQuestion = shuffledQuestions[currentQuestionIndex];
      const payload = {
        userId: user.id,
        lessonId: parseInt(lessonId),
        wordId: currentQuestion.wordId,
        questionType: 2, // 2 = audio test
        isCorrect,
        lessonWordId: currentQuestion.lessonWordId || 0
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
      console.error('Error sending progress:', error);
    }
  }, [currentQuestionIndex, lessonId, shuffledQuestions]);

  const startTest = () => {
    if (testQuestions[TEST_TYPES.AUDIO].length === 0) {
      alert(`Нет вопросов для аудио теста. Доступно:
      Аудио: ${testQuestions.audio.length}
      Продвинутый тест: ${testQuestions['advanced-test'].length}`);
      return;
    }
    
    setTestStarted(true);
    setTimerActive(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setErrors(0);
    setTime(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setQuestionTimeLeft(15);
    setTimeExpired(false);
    setIsPlaying(false);
  };

  const handleTimeExpired = useCallback(async () => {
    setErrors(prev => prev + 1);
    await sendProgress(false);
    setTimeout(goToNextQuestion, 2000);
  }, [sendProgress]);

  const handleAnswerSelect = useCallback(async (answer) => {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    if (!currentQuestion || timeExpired) return;
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    setSelectedAnswer(answer);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      setErrors(prev => prev + 1);
    }
    
    await sendProgress(isCorrect);
    setTimeout(goToNextQuestion, 2000);
  }, [currentQuestionIndex, shuffledQuestions, timeExpired, sendProgress]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setQuestionTimeLeft(15);
      setTimeExpired(false);
      setIsPlaying(false);
    } else {
      finishTest();
    }
  }, [currentQuestionIndex, shuffledQuestions.length]);

  const finishTest = useCallback(() => {
    setTimerActive(false);
    setShowResults(true);
  }, []);

  const getOptionClass = useCallback((option) => {
    if (!selectedAnswer && !timeExpired) return '';
    
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const isCorrect = option === currentQuestion?.correctAnswer;
    const isSelected = option === selectedAnswer;
    
    if (timeExpired && isCorrect) return 'correct-highlight';
    if (isCorrect && (selectedAnswer || timeExpired)) return 'correct';
    if (isSelected && !isCorrect) return 'incorrect';
    return '';
  }, [currentQuestionIndex, selectedAnswer, shuffledQuestions, timeExpired]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const navigateToTest = useCallback((testId) => {
    navigate(`/lessonsVirtual/${lessonId}/${testId}`);
  }, [lessonId, navigate]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex] || {};
  const totalQuestions = shuffledQuestions.length;

  if (!isAuthenticated) return null;

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

  if (testQuestions[TEST_TYPES.AUDIO].length === 0 && !loading) {
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
                  testType={TEST_TYPES.AUDIO}
                  totalQuestions={testQuestions[TEST_TYPES.AUDIO].length}
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
                  testType={TEST_TYPES.AUDIO}
                />
              ) : (
                <ActiveTestScreen
                  testType={TEST_TYPES.AUDIO}
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
                  playAudio={playAudio}
                  isPlaying={isPlaying}
                />
              )}
            </div>

            {(!testStarted || showResults) && (
              <TestSidebar
                testType={TEST_TYPES.AUDIO}
                testStarted={testStarted}
                showResults={showResults}
                wordStats={wordStats}
                quizData={DEFAULT_QUIZ_DATA}
                testQuestions={testQuestions}
                navigateToTest={navigateToTest}
                lessonId={lessonId}
                testResults={detailedProgress?.testResults || []}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioTestPage;