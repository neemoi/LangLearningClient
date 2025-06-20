import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../../components/layout/Sidebar/Sidebar';
import TestSidebar from '../image/TestSidebar';
import StartScreen from '../image/StartScreen';
import ActiveTestScreen from '../image/ActiveTestScreen';
import ResultsScreen from '../audio/ResultsAudioScreen';
import EmptyTestState from '../audioImage/EmptyTestState';
import API_CONFIG from '../../../../components/src/config';
import './css/AudioTestPage.css';

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
    image: [], audio: [], 'audio-image': [], spelling: [], grammar: []
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      const user = JSON.parse(localStorage.getItem('currentUser'));
      
      const [allWordsRes, lessonWordsRes, quizzesRes, wordStatsRes, progressRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/api/Words`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/Lessons/${lessonId}/words`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
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

      if ([allWordsRes, lessonWordsRes, quizzesRes, wordStatsRes, progressRes].some(res => res.status === 401)) {
        handleUnauthorized();
        return;
      }

      const [allWordsData, lessonWordsData, quizzesData, wordStatsData, progressData] = await Promise.all([
        allWordsRes.json(),
        lessonWordsRes.json(),
        quizzesRes.json(),
        wordStatsRes.json(),
        progressRes.json()
      ]);
      
      setAllWords(allWordsData);
      setLessonWords(lessonWordsData);
      setTestQuestions(processQuestions(quizzesData, allWordsData, lessonWordsData));
      setWordStats(wordStatsData);
      setDetailedProgress(progressData);
      
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

  const processQuestions = (quizzesData, wordsData, lessonWordsData) => {
    const result = { image: [], audio: [], 'audio-image': [], spelling: [], grammar: [] };

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
          result['audio-image'].push(processedQuestion);
        } else if (qType.includes('audio')) {
          result.audio.push(processedQuestion);
        } else if (qType.includes('image')) {
          result.image.push(processedQuestion);
        } else if (qType.includes('spelling')) {
          result.spelling.push(processedQuestion);
        } else if (qType.includes('grammar')) {
          result.grammar.push(processedQuestion);
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
    if (testQuestions.audio?.length) {
      setShuffledQuestions([...testQuestions.audio].sort(() => 0.5 - Math.random()));
    }
  }, [testQuestions]);

  const playAudio = () => {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    if (!currentQuestion?.audioUrl) return;
    
    const audio = new Audio(currentQuestion.audioUrl);
    audio.play().catch(e => console.error('Error playing audio:', e));
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
  };

  const sendProgress = async (isCorrect) => {
    try {
      const token = localStorage.getItem('userToken');
      const user = JSON.parse(localStorage.getItem('currentUser'));
      
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }

      const currentQuestion = shuffledQuestions[currentQuestionIndex];
      if (!currentQuestion?.wordId) {
        console.error('Missing wordId for question:', currentQuestion);
        return;
      }

      const payload = {
        userId: user.id,
        lessonId: parseInt(lessonId),
        wordId: currentQuestion.wordId,
        questionType: 2, // 2 = audio test
        isCorrect,
        lessonWordId: currentQuestion.lessonWordId || 0
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/UserProgress/word-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending progress:', error);
    }
  };

  const startTest = () => {
    if (shuffledQuestions.length === 0) {
      alert(`Нет вопросов для теста. Доступно:
      Аудио: ${testQuestions.audio.length}
      Грамматика: ${testQuestions.grammar.length}`);
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

  const handleTimeExpired = async () => {
    setErrors(prev => prev + 1);
    await sendProgress(false);
    setTimeout(goToNextQuestion, 2000);
  };

  const handleAnswerSelect = async (answer) => {
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
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setQuestionTimeLeft(15);
      setTimeExpired(false);
      setIsPlaying(false);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    setTimerActive(false);
    setShowResults(true);
  };

  const getOptionClass = (option) => {
    if (!selectedAnswer && !timeExpired) return '';
    
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === selectedAnswer;
    
    if (timeExpired && isCorrect) return 'correct-highlight';
    if (isCorrect && (selectedAnswer || timeExpired)) return 'correct';
    if (isSelected && !isCorrect) return 'incorrect';
    return '';
  };

  if (!isAuthenticated) {
    return null;
  }

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

  if (shuffledQuestions.length === 0 && !loading) {
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
                  testType="audio"
                  totalQuestions={shuffledQuestions.length}
                  quizData={quizData}
                  startTest={startTest}
                />
              ) : showResults ? (
                <ResultsScreen 
                  score={score}
                  totalQuestions={shuffledQuestions.length}
                  errors={errors}
                  time={time}
                  wordStats={wordStats}
                  startTest={startTest}
                  lessonId={lessonId}
                  testType="audio"
                />
              ) : (
                <ActiveTestScreen
                  testType="audio"
                  currentQuestion={shuffledQuestions[currentQuestionIndex]}
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={shuffledQuestions.length}
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
                testType="audio"
                testStarted={testStarted}
                showResults={showResults}
                wordStats={wordStats}
                quizData={quizData}
                testQuestions={testQuestions}
                navigate={navigate}
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