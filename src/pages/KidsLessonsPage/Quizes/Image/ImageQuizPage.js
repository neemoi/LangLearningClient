import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../../components/layout/Sidebar/Sidebar';
import './../../css/ImageQuizPage.css';
import API_CONFIG from '../../../../components/src/config';
import QuizHeader from './QuizHeader';
import ScoreDisplay from './ScoreDisplay';
import ResultsBlock from './ResultsBlock';
import QuestionBlock from './QuestionBlock';
import StartScreen from './StartScreen';
import OtherTestsBlock from './OtherTestsBlock';

const ImageQuizPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [wordCards, setWordCards] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showCorrect, setShowCorrect] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [resultsSent, setResultsSent] = useState(false);
  const [wordProgress, setWordProgress] = useState([]);
  const [testStarted, setTestStarted] = useState(false);
  
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
          fetch(`${API_CONFIG.BASE_URL}/api/KidQuizQuestions/byLesson/${lessonId}?quizTypeId=1`),
          fetch(`${API_CONFIG.BASE_URL}/api/KidWordCard/lesson/${lessonId}`),
          fetch(`${API_CONFIG.BASE_URL}/api/kid-lessons/${lessonId}`),
          fetch(`${API_CONFIG.BASE_URL}/api/kid-progress/words?userId=${user.id}&lessonId=${lessonId}`)
        ]);
        
        const [questionsData, wordsData, lessonData, progressData] = await Promise.all([
          questionsRes.json(),
          wordsRes.json(),
          lessonRes.json(),
          progressRes.ok ? progressRes.json() : []
        ]);
        
        const filteredQuestions = questionsData.filter(q => q.quizTypeId === 1);
        if (filteredQuestions.length === 0) {
          throw new Error('Для этого урока нет вопросов типа "Картинки"');
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
    if (!testStarted || completed || loading) return;
    
    setTimeLeft(15);
    setShowCorrect(false);
    clearInterval(timerRef.current);
    
    if (!selectedAnswer) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
    }
    
    return () => clearInterval(timerRef.current);
  }, [currentQuestionIndex, selectedAnswer, completed, loading, testStarted]);

  useEffect(() => {
    if (timeLeft === 0 && !selectedAnswer && !showCorrect && options.length > 0 && testStarted) {
      handleTimeExpired();
    }
  }, [timeLeft, selectedAnswer, showCorrect, options, testStarted]);

  const generateOptions = (question, allWords) => {
    const correctWord = allWords.find(word => 
      word.imageUrl === question.imageUrl || word.word === question.correctAnswer
    );
    
    if (!correctWord) {
      setError('Не найдено правильного варианта для вопроса');
      return;
    }
    
    const shuffledWords = shuffleArray(allWords.filter(word => word.id !== correctWord.id));
    const wrongWords = shuffledWords.slice(0, 3);
    
    const allOptions = [
      { ...correctWord, isCorrect: true },
      ...wrongWords.map(word => ({ ...word, isCorrect: false }))
    ].sort(() => 0.5 - Math.random());
    
    setOptions(allOptions);
  };

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
            testType: 'image_choice',
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

  const updateWordProgress = async (word, isCorrect) => {
    try {
      const user = getCurrentUser();
      if (!user) return false;

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
            questionType: 'image_choice',
            isCorrect: isCorrect
          })
        });

        if (!response.ok) return false;

        setWordProgress(prev => prev.map(progress => 
          progress.id === existingProgress.id 
            ? { ...progress, isCorrect } 
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
            questionType: 'image_choice',
            isCorrect: isCorrect
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

  const handleAnswerSelect = async (word) => {
    if (selectedAnswer) return;
    
    clearInterval(timerRef.current);
    setSelectedAnswer(word.id);
    
    const success = await updateWordProgress(word, word.isCorrect);
    
    if (success) {
      if (word.isCorrect) {
        setCorrectAnswers(prev => prev + 1);
      } else {
        setWrongAnswers(prev => prev + 1);
      }

      setTimeout(nextQuestion, 2000);
    } else {
      setError('Ошибка сохранения результата');
    }
  };

  const handleTimeExpired = async () => {
    const correctOption = options.find(opt => opt.isCorrect);
    if (!correctOption) {
      setError('Не найдено правильного варианта');
      setTimeout(nextQuestion, 2000);
      return;
    }
    
    setShowCorrect(true);
    setSelectedAnswer(correctOption.id);
    
    const success = await updateWordProgress(correctOption, false);
    
    if (success) {
      setWrongAnswers(prev => prev + 1);
      setTimeout(nextQuestion, 2000);
    } else {
      setError('Ошибка сохранения результата');
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      generateOptions(shuffledQuestions[currentQuestionIndex + 1], wordCards);
      setSelectedAnswer(null);
      setShowCorrect(false);
    } else {
      setEndTime(new Date());
      setCompleted(true);
    }
  };

  const startTest = () => {
    setTestStarted(true);
    setStartTime(new Date());
    if (shuffledQuestions.length > 0) {
      generateOptions(shuffledQuestions[0], wordCards);
    }
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
      <div className="image-quiz-app">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="image-quiz-loading-state">
          <div className="image-quiz-spinner"></div>
          <p>Загружаем задания...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="image-quiz-app">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="image-quiz-error-state">
          <h3>Произошла ошибка</h3>
          <p>{error}</p>
          <button 
            className="image-quiz-retry-button"
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="image-quiz-app">
      <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <div className="image-quiz-content">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`image-quiz-main ${sidebarOpen ? 'with-sidebar' : ''}`}>
          <QuizHeader lessonTitle={lessonTitle} lessonId={lessonId} />
          
          <div className="image-quiz-container">
            {!testStarted ? (
              <StartScreen lessonTitle={lessonTitle} onStart={startTest} />
            ) : !completed ? (
              <>
                <QuestionBlock 
                  question={shuffledQuestions[currentQuestionIndex]}
                  options={options}
                  selectedAnswer={selectedAnswer}
                  showCorrect={showCorrect}
                  handleAnswerSelect={handleAnswerSelect}
                  timeLeft={timeLeft}
                  speakWord={speakWord}
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

export default ImageQuizPage;