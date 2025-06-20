import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../../components/layout/Sidebar/Sidebar';
import API_CONFIG from '../../../../components/src/config';
import ActiveTestScreen from './ActiveTestScreen';
import ResultsImageScreen from './ResultsImageScreen';
import StartScreen from './StartScreen';
import EmptyTestState from './../audioImage/EmptyTestState';
import TestSidebar from './TestSidebar';
import './css/ImageTestPage.css';

const Loader = () => (
  <div className="loader-container">
    <div className="loader-spinner"></div>
    <p>Загрузка теста...</p>
  </div>
);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const ImageTestPage = () => {
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
    image: [], audio: [], 'audio-image': [], spelling: [], grammar: []
  });
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [allWords, setAllWords] = useState([]);
  const [lessonWords, setLessonWords] = useState([]);
  const [bestResults, setBestResults] = useState({ score: 0, time: 0 });
  const [detailedProgress, setDetailedProgress] = useState(null);
  const [quizProgress, setQuizProgress] = useState({
    image: 0, audio: 0, 'audio-image': 0, spelling: 0, grammar: 0
  });
  const [wordStats, setWordStats] = useState({
    totalWordsInLesson: 0,
    learnedWordsInLesson: 0,
    totalWordsOverall: 0,
    learnedWordsOverall: 0
  });

  const quizData = {
    nouns: [
      { id: 'image', icon: 'https://winner.gfriend.com/Content/images/vc-but04.png', tooltip: 'Изображение/Текст' },
      { id: 'audio', icon: 'https://winner.gfriend.com/Content/images/vc-but05.png', tooltip: 'Текст/Звукозапись' },
      { id: 'audio-image', icon: 'https://winner.gfriend.com/Content/images/vc-but06.png', tooltip: 'Изображение/Звукозапись' },
      { id: 'spelling', icon: 'https://winner.gfriend.com/Content/images/vc-but07.png', tooltip: 'Правописание/Печать' }
    ],
    grammar: [
      { id: 'grammar', icon: 'https://winner.gfriend.com/Content/images/vc-but08.png', tooltip: 'Грамматика' }
    ]
  };

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateToTest = (testId) => {
    navigate(`/lessonsVirtual/${lessonId}/${testId}`);
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
      
      const quizTypes = ['image', 'audio', 'audio-image', 'spelling', 'grammar'];
      const progressMap = {};
      quizTypes.forEach(type => {
        const quizId = getQuestionType(type);
        const quiz = progressData?.quizzes?.find(q => q.quizId === quizId) || {};
        const progress = quiz ? Math.round((quiz.correctAnswers / (quiz.totalQuestions || 1)) * 100) : 0;
        progressMap[type] = isNaN(progress) ? 0 : progress;
      });
      setQuizProgress(progressMap);
      
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      setAllWords([]);
      setLessonWords([]);
      setTestQuestions({ image: [], audio: [], 'audio-image': [], spelling: [], grammar: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userToken');
    navigate('/');
  };

  const processQuestions = (quizzesData, wordsData) => {
    const result = { 
      image: [], 
      audio: [], 
      'audio-image': [], 
      spelling: [],
      grammar: [] 
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
            result.image.push(processedQuestion);
          } else if (qType.includes('audio') && !qType.includes('image')) {
            result.audio.push(processedQuestion);
          } else if (qType.includes('audio') && qType.includes('image')) {
            result['audio-image'].push(processedQuestion);
          } else if (qType.includes('spelling')) {
            result.spelling.push(processedQuestion);
          } else if (qType.includes('grammar')) {
            result.grammar.push(processedQuestion);
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

  const getQuestionType = (type) => {
    switch(type) {
      case 'image': return 1;
      case 'audio': return 2;
      case 'audio-image': return 3;
      case 'spelling': return 4;
      case 'grammar': return 5;
      default: return 0;
    }
  };

  const startTest = () => {
    if (testQuestions[testType].length === 0) {
      alert(`Нет вопросов для теста. Доступно:
      Изображения: ${testQuestions.image.length}
      Аудио: ${testQuestions.audio.length}
      Аудио+Изображение: ${testQuestions['audio-image'].length}
      Правописание: ${testQuestions.spelling.length}
      Грамматика: ${testQuestions.grammar.length}`);
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
    if (!currentQuestion || timeExpired) return;
    
    const isCorrect = answer === currentQuestion.correctAnswer;
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
    
    const currentScore = Math.round((score / shuffledQuestions.length) * 100);
    const isNewRecord = currentScore > bestResults.score || 
                      (currentScore === bestResults.score && time < bestResults.time);
    
    if (isNewRecord) {
      setBestResults({ score: currentScore, time });
    }

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
        return;
      }

      if (!response.ok) {
        throw new Error(`Ошибка HTTP! статус: ${response.status}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('Ошибка при отправке прогресса:', error);
    }
  };

  const getOptionClass = (option) => {
    if (!selectedAnswer && !timeExpired) return "option-btn";
    
    const isCorrect = option === currentQuestion?.correctAnswer;
    const isSelected = option === selectedAnswer;
    
    if (timeExpired && isCorrect) return "option-btn correct-highlight";
    if (isCorrect && (selectedAnswer || timeExpired)) return "option-btn correct";
    if (isSelected && !isCorrect) return "option-btn incorrect";
    return "option-btn";
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
                  quizData={quizData}
                  startTest={startTest}
                />
              ) : showResults ? (
                <ResultsImageScreen
                  score={score}
                  totalQuestions={shuffledQuestions.length}
                  errors={errors}
                  time={time}
                  wordStats={wordStats}
                  startTest={startTest}
                  lessonId={lessonId}
                  testType="image"
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

export default ImageTestPage;