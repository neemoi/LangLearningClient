import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../components/layout/Navigation/Navigation';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import API_CONFIG from '../../components/src/config';
import './css/KidMonitoringPage.css';

const KidProgressPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lessonInfo, setLessonInfo] = useState(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLearned, setShowLearned] = useState(false);
  const [lessonsList, setLessonsList] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [allWords, setAllWords] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/kid-lessons`);
        if (!response.ok) throw new Error('Failed to fetch lessons');
        const data = await response.json();
        setLessonsList(data);
        
        if (lessonId) {
          const lesson = data.find(l => l.id === parseInt(lessonId));
          if (lesson) setLessonTitle(lesson.title);
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
      }
    };
    fetchLessons();
  }, [lessonId]);

  useEffect(() => {
    const fetchAllWords = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/KidWordCard/lesson/${lessonId}`);
        if (!response.ok) throw new Error('Failed to fetch words');
        const words = await response.json();
        setAllWords(words);
      } catch (err) {
        console.error('Error fetching words:', err);
      }
    };

    if (lessonId) {
      fetchAllWords();
    }
  }, [lessonId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user?.id) {
          return;
        }

        const wordsResponse = await fetch(
          `${API_CONFIG.BASE_URL}/api/kid-progress/words?userId=${user.id}&lessonId=${lessonId}`
        );
        
        const wordsData = wordsResponse.ok ? await wordsResponse.json() : [];
        
        const testsResponse = await fetch(
          `${API_CONFIG.BASE_URL}/api/kid-progress/lesson/full?userId=${user.id}&lessonId=${lessonId}`
        );
        
        const testsData = testsResponse.ok ? await testsResponse.json() : null;
        
        const transformedData = processWordsData(wordsData);
        setLessonInfo(transformedData);
        setResults(testsData);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonId) {
      fetchData();
    }
  }, [lessonId, lessonsList, allWords]);

  const processWordsData = (data) => {
    const wordsMap = new Map();
    
    allWords.forEach(word => {
      wordsMap.set(word.id, {
        id: word.id,
        word: word.word || 'Unknown word',
        imageUrl: word.imageUrl,
        audioUrl: word.audioUrl,
        quiz1: false,
        quiz2: false,
        quiz3: false,
        quiz4: false,
        isLearned: false,
        hasProgress: false
      });
    });
    
    data.forEach(item => {
      if (wordsMap.has(item.wordId)) {
        const word = wordsMap.get(item.wordId);
        word.hasProgress = true;
        
        switch(item.questionType) {
          case 'image_choice': word.quiz1 = item.isCorrect; break;
          case 'audio_choice': word.quiz2 = item.isCorrect; break;
          case 'image_audio_choice': word.quiz3 = item.isCorrect; break;
          case 'spelling': word.quiz4 = item.isCorrect; break;
        }
        
        word.isLearned = word.quiz1 && word.quiz2 && word.quiz3 && word.quiz4;
      }
    });
    
    return {
      title: lessonTitle || "Unknown Lesson",
      number: lessonId,
      keywords: Array.from(wordsMap.values())
    };
  };

  const getScore = (testType) => {
    if (!results?.testResults) return '0%';
    const test = results.testResults.find(t => t.testType === testType);
    return test ? `${test.score}%` : '0%';
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleLearnedFilter = () => setShowLearned(!showLearned);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  if (isLoading) {
    return (
      <div className="kid-progress-page progress-loading">
        <div className="progress-spinner">
          <div className="progress-rainbow"></div>
          <p>Загружаем ваши успехи...</p>
        </div>
      </div>
    );
  }

  const filteredWords = showLearned 
    ? lessonInfo?.keywords?.filter(word => word.isLearned) || []
    : lessonInfo?.keywords || [];

  return (
    <div className="kid-progress-page">
      <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="kid-progress-content">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="kid-progress-main" style={{ marginLeft: isSidebarOpen ? '250px' : '0' }}>
          <div className="progress-header">
            <div className="progress-mobile-header visible-mobile">
              <h1 className="progress-title">Мои успехи</h1>
              <h2 className="progress-subtitle">Урок {lessonInfo?.number}: {lessonInfo?.title}</h2>
            </div>

            <div className="progress-desktop-header hidden-mobile">
              <div className="progress-lesson-selector-wrapper">
                <div className="progress-lesson-selector">
                  <button 
                    className="progress-lesson-btn" 
                    onClick={toggleDropdown}
                    aria-expanded={isDropdownOpen}
                  >
                    <span className="progress-star-icon">⭐</span> 
                    Урок {lessonInfo?.number}
                    <span className={`progress-dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                      {isDropdownOpen ? '▲' : '▼'}
                    </span>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="progress-lessons-dropdown">
                      {lessonsList.map(lesson => (
                        <button
                          key={lesson.id}
                          className={`progress-dropdown-lesson ${parseInt(lessonId) === lesson.id ? 'active' : ''}`}
                          onClick={() => {
                            navigate(`/kids-monitoring/${lesson.id}`);
                            setIsDropdownOpen(false);
                          }}
                        >
                          Урок {lesson.id}: {lesson.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="progress-header-center">
                <div className="progress-header-content">
                  <h1 className="progress-title">Мои успехи</h1>
                  <h2 className="progress-subtitle">Урок {lessonInfo?.number}: {lessonInfo?.title}</h2>
                  {results?.completedAt && (
                    <div className="progress-completion-info">
                      🎉 Завершено: {new Date(results.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="progress-header-controls">
                <button className="progress-home-btn" onClick={() => navigate(`/kids-lessons/${lessonId}`)}>
                  🏠 Домой
                </button>
              </div>
            </div>
          </div>

          <div className="progress-controls-panel">
            <div className="progress-filter-toggle">
              <label className="progress-toggle-switch">
                <input 
                  type="checkbox" 
                  checked={showLearned}
                  onChange={toggleLearnedFilter}
                />
                <span className="progress-slider round"></span>
              </label>
              <span>Показать только выученные слова</span>
            </div>
            
            <div className="progress-badge">
              <span className="progress-icon">🏆</span>
            </div>
          </div>

          <div className="progress-keywords-container">
            <table className="progress-keywords-table">
              <thead>
                <tr>
                  <th className="progress-position">№</th>
                  <th className="progress-word">Слово</th>
                  <th>
                    <a href={`/kids-lessons/${lessonId}/quiz-1`} className="progress-quiz-header" title="Тест с картинками">
                      <img src="https://winner.gfriend.com/Content/images/nounquiz-1.png" alt="Quiz 1" className="progress-quiz-icon" />
                      <div className="progress-quiz-score">{getScore('image_choice')}</div>
                    </a>
                  </th>
                  <th>
                    <a href={`/kids-lessons/${lessonId}/quiz-2`} className="progress-quiz-header" title="Тест с аудио">
                      <img src="https://winner.gfriend.com/Content/images/nounquiz-3.png" alt="Quiz 2" className="progress-quiz-icon" />
                      <div className="progress-quiz-score">{getScore('audio_choice')}</div>
                    </a>
                  </th>
                  <th>
                    <a href={`/kids-lessons/${lessonId}/quiz-3`} className="progress-quiz-header" title="Тест с картинками и аудио">
                      <img src="https://winner.gfriend.com/Content/images/nounquiz-2.png" alt="Quiz 3" className="progress-quiz-icon" />
                      <div className="progress-quiz-score">{getScore('image_audio_choice')}</div>
                    </a>
                  </th>
                  <th>
                    <a href={`/kids-lessons/${lessonId}/quiz-4`} className="progress-quiz-header" title="Тест на правописание">
                      <img src="https://winner.gfriend.com/Content/images/nounquiz-4.png" alt="Quiz 4" className="progress-quiz-icon" />
                      <div className="progress-quiz-score">{getScore('spelling')}</div>
                    </a>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredWords.length > 0 ? (
                  filteredWords.map((word, index) => (
                    <tr key={word.id} className={word.isLearned ? 'progress-word-learned' : ''}>
                      <td className="progress-position">{index + 1}</td>
                      <td className="progress-word">
                        <div className="progress-word-container">
                          <span>{word.word}</span>
                          {word.isLearned && <span className="progress-learned-badge">✓</span>}
                        </div>
                      </td>
                      <td className={word.quiz1 ? 'progress-quiz-passed' : 'progress-quiz-failed'}>
                        {word.hasProgress ? (word.quiz1 ? '✓' : '✗') : '✗'}
                      </td>
                      <td className={word.quiz2 ? 'progress-quiz-passed' : 'progress-quiz-failed'}>
                        {word.hasProgress ? (word.quiz2 ? '✓' : '✗') : '✗'}
                      </td>
                      <td className={word.quiz3 ? 'progress-quiz-passed' : 'progress-quiz-failed'}>
                        {word.hasProgress ? (word.quiz3 ? '✓' : '✗') : '✗'}
                      </td>
                      <td className={word.quiz4 ? 'progress-quiz-passed' : 'progress-quiz-failed'}>
                        {word.hasProgress ? (word.quiz4 ? '✓' : '✗') : '✗'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="progress-no-words">
                      {showLearned 
                        ? "У вас пока нет выученных слов в этом уроке" 
                        : "Нет данных о словах для этого урока"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default KidProgressPage;