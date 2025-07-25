import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../../components/layout/Sidebar/Sidebar';
import './../../css/SpellingQuiz.css';
import API_CONFIG from '../../../../components/src/config';
import OtherTestsBlock from './../SpellingQuiz/OtherTestsBlock';
import StartScreen from './../SpellingQuiz/StartScreen';
import QuestionBlock from './../SpellingQuiz/QuestionBlock';
import ResultsBlock from './../SpellingQuiz/ResultsBlock';
import ScoreDisplay from './../SpellingQuiz/ScoreDisplay';
import QuizHeader from './../SpellingQuiz/QuizHeader';
import NoTestAvailable from './../SpellingQuiz//NoTestAvailable';

const GrammarQuizPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [wordCards, setWordCards] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answerStatus, setAnswerStatus] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [resultsSent, setResultsSent] = useState(false);
  const [wordProgress, setWordProgress] = useState([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testAvailable, setTestAvailable] = useState(true);
  
  const timerRef = useRef();
  const speechSynthesisRef = useRef(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const speakWord = (word) => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const getCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user?.id) {
      navigate('/login');
      return null;
    }
    return user;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const user = getCurrentUser();
        if (!user) return;
        
        const [questionsRes, wordsRes, lessonRes, progressRes] = await Promise.all([
          fetch(`${API_CONFIG.BASE_URL}/api/KidQuizQuestions/byLesson/${lessonId}?quizTypeId=4`),
          fetch(`${API_CONFIG.BASE_URL}/api/KidWordCard/lesson/${lessonId}`),
          fetch(`${API_CONFIG.BASE_URL}/api/Lessons/${lessonId}`),
          fetch(`${API_CONFIG.BASE_URL}/api/kid-progress/words?userId=${user.id}&lessonId=${lessonId}`)
        ]);
        
        const [questionsData, wordsData, lessonData, progressData] = await Promise.all([
          questionsRes.json(),
          wordsRes.json(),
          lessonRes.json(),
          progressRes.ok ? progressRes.json() : []
        ]);
        
        const filteredQuestions = questionsData.filter(q => q.quizTypeId === 4);
        
        if (filteredQuestions.length === 0) {
          setTestAvailable(false);
          setLessonTitle(lessonData.title || `Урок ${lessonId}`);
          return;
        }
        
        const shuffled = shuffleArray(filteredQuestions);
        setQuestions(filteredQuestions);
        setShuffledQuestions(shuffled);
        setWordCards(wordsData);
        setLessonTitle(lessonData.title || `Урок ${lessonId}`);
        setWordProgress(progressData);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [lessonId, navigate]);

  useEffect(() => {
    if (completed && !resultsSent) {
      sendTestResults();
    }
  }, [completed, resultsSent]);

  useEffect(() => {
    if (!testStarted || completed || loading || !testAvailable) return;
    
    setTimeLeft(30);
    setAnswerStatus(null);
    setUserAnswer('');
    clearInterval(timerRef.current);
    
    if (answerStatus === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
    }
    
    return () => clearInterval(timerRef.current);
  }, [currentQuestionIndex, answerStatus, completed, loading, testStarted, testAvailable]);

  useEffect(() => {
    if (timeLeft === 0 && answerStatus === null && testStarted && testAvailable) {
      handleTimeExpired();
    }
  }, [timeLeft, answerStatus, testStarted, testAvailable]);

  const sendTestResults = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      const percentage = calculatePercentage();
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/kid-progress/lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          lessonId: parseInt(lessonId),
          completedAt: new Date().toISOString(),
          learnedWords: correctAnswers,
          testResults: [{
            testType: 'spelling',
            score: percentage,
            quizId: parseInt(lessonId)
          }]
        })
      });

      if (!response.ok) throw new Error('Ошибка сохранения результатов теста');

      setResultsSent(true);
    } catch (err) {
      console.error('Ошибка при отправке результатов:', err);
    }
  };

  const updateWordProgress = async (isCorrectAnswer) => {
    try {
      const user = getCurrentUser();
      if (!user) return false;

      const currentQuestion = shuffledQuestions[currentQuestionIndex];
      const word = wordCards.find(w => w.word === currentQuestion.correctAnswer || w.imageUrl === currentQuestion.imageUrl);
      
      if (!word) return false;

      const existingProgress = wordProgress.find(
        progress => progress.wordId === word.id && progress.lessonId === parseInt(lessonId)
      );

      if (existingProgress) {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/kid-progress/word`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: existingProgress.id,
            userId: user.id,
            lessonId: parseInt(lessonId),
            wordId: word.id,
            questionType: 'spelling',
            isCorrect: isCorrectAnswer
          })
        });

        if (!response.ok) return false;

        setWordProgress(prev => prev.map(progress => 
          progress.id === existingProgress.id 
            ? { ...progress, isCorrect: isCorrectAnswer } 
            : progress
        ));
      } else {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/kid-progress/word`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            lessonId: parseInt(lessonId),
            wordId: word.id,
            questionType: 'spelling',
            isCorrect: isCorrectAnswer
          })
        });

        if (!response.ok) return false;

        const newProgress = await response.json();
        setWordProgress(prev => [...prev, newProgress]);
      }

      return true;
    } catch (err) {
      console.error('Ошибка обновления прогресса слова:', err);
      return false;
    }
  };

  const checkAnswer = (answer) => {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const correctAnswer = currentQuestion.correctAnswer.toLowerCase().trim();
    const userAnswerNormalized = answer.toLowerCase().trim();
    
    return userAnswerNormalized === correctAnswer;
  };

  const handleAnswerSubmit = async () => {
    if (userAnswer.trim() === '' || answerStatus !== null) return;
    
    clearInterval(timerRef.current);
    const correct = checkAnswer(userAnswer);
    setAnswerStatus(correct ? 'correct' : 'wrong');
    
    const success = await updateWordProgress(correct);
    
    if (success) {
      if (correct) {
        setCorrectAnswers(prev => prev + 1);
      } else {
        setWrongAnswers(prev => prev + 1);
      }
      nextQuestion();
    } else {
      setError('Ошибка сохранения результата');
    }
  };

  const handleTimeExpired = async () => {
    clearInterval(timerRef.current);
    setAnswerStatus('wrong');
    
    const success = await updateWordProgress(false);
    
    if (success) {
      setWrongAnswers(prev => prev + 1);
      nextQuestion();
    } else {
      setError('Ошибка сохранения результата');
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswerStatus(null);
      setUserAnswer('');
    } else {
      setEndTime(new Date());
      setCompleted(true);
    }
  };

  const startTest = () => {
    setTestStarted(true);
    setStartTime(new Date());
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const calculateTimeTaken = () => {
    if (!startTime || !endTime) return '0:00';
    const diff = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const calculatePercentage = () => {
    const totalQuestions = shuffledQuestions.length;
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  if (loading) {
    return (
      <div className="xq-quiz-app">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="xq-loading-state">
          <div className="xq-spinner"></div>
          <p>Загружаем задания...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="xq-quiz-app">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="xq-error-state">
          <h3>Произошла ошибка</h3>
          <p>{error}</p>
          <button 
            className="xq-retry-button"
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!testAvailable) {
    return (
      <div className="xq-quiz-app">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="xq-quiz-content">
          <Sidebar isOpen={sidebarOpen} />
          <main className={`xq-quiz-main ${sidebarOpen ? 'with-sidebar' : ''}`}>
            <QuizHeader lessonTitle={lessonTitle} lessonId={lessonId} />
            <NoTestAvailable lessonId={lessonId} />
          </main>
        </div>
      </div>
    );
  }

 return (
    <div className="xq-quiz-app">
      <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <div className="xq-quiz-content">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`xq-quiz-main ${sidebarOpen ? 'with-sidebar' : ''}`}>
          <QuizHeader lessonTitle={lessonTitle} lessonId={lessonId} />
          
          <div className="xq-question-container">
            {!testStarted ? (
              <StartScreen lessonTitle={lessonTitle} onStart={startTest} />
            ) : !completed ? (
              <>
                <QuestionBlock 
                  question={shuffledQuestions[currentQuestionIndex]}
                  userAnswer={userAnswer}
                  setUserAnswer={setUserAnswer}
                  handleAnswerSubmit={handleAnswerSubmit}
                  timeLeft={timeLeft}
                  speakWord={speakWord}
                  answerStatus={answerStatus}
                  correctAnswer={shuffledQuestions[currentQuestionIndex]?.correctAnswer}
                />
                <ScoreDisplay 
                  correctAnswers={correctAnswers} 
                  wrongAnswers={wrongAnswers} 
                />
              </>
            ) : (
              <ResultsBlock 
                correctAnswers={correctAnswers}
                wrongAnswers={wrongAnswers}
                calculateTimeTaken={calculateTimeTaken}
                calculatePercentage={calculatePercentage}
                lessonId={lessonId}
              />
            )}
          </div>
          
          <OtherTestsBlock lessonId={lessonId} />
        </main>
      </div>
    </div>
  );
};

export default GrammarQuizPage;