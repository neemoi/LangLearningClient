import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/layout/Navigation/Navigation';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import API_CONFIG from '../../components/src/config';
import './css/KidsLessonsPage.css';

const KidsLessonsPage = () => {
  const { lessonId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [quizProgress, setQuizProgress] = useState({
    quiz1: 0,
    quiz2: 0,
    quiz3: 0,
    quiz4: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

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
    if (!authStatus) return;

    const fetchData = async () => {
      try {
        const lessonsResponse = await fetch(`${API_CONFIG.BASE_URL}/api/kid-lessons`);
        if (!lessonsResponse.ok) throw new Error('Не удалось загрузить уроки');
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData);
        
        const lessonToLoad = lessonId || (lessonsData.length > 0 ? lessonsData[0].id : null);
        if (lessonToLoad) {
          const lessonResponse = await fetch(`${API_CONFIG.BASE_URL}/api/kid-lessons/${lessonToLoad}`);
          if (!lessonResponse.ok) throw new Error('Не удалось загрузить урок');
          const lessonData = await lessonResponse.json();
          setCurrentLesson(lessonData);
          setSelectedLesson(`Урок ${lessonData.id}-${lessonData.title}`);

          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if (currentUser?.id) {
            const progressResponse = await fetch(
              `${API_CONFIG.BASE_URL}/api/kid-progress/lesson/full?userId=${currentUser.id}&lessonId=${lessonToLoad}`
            );
            if (progressResponse.ok) {
              const progressData = await progressResponse.json();
              updateQuizProgress(progressData.testResults);
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId, navigate]);

  const updateQuizProgress = (testResults) => {
    const newProgress = { quiz1: 0, quiz2: 0, quiz3: 0, quiz4: 0 };
    
    testResults.forEach(test => {
      switch(test.testType) {
        case 'image_choice':
          newProgress.quiz1 = test.score;
          break;
        case 'audio_choice':
          newProgress.quiz2 = test.score;
          break;
        case 'image_audio_choice':
          newProgress.quiz3 = test.score;
          break;
        case 'spelling':
          newProgress.quiz4 = test.score;
          break;
      }
    });
    
    setQuizProgress(newProgress);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.children-lesson-selector-wrapper')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const startQuiz = (quizNumber) => navigate(`/kids-lessons/${lessonId}/quiz-${quizNumber}`);
  const handleLessonChange = (lesson) => {
    navigate(`/kids-lessons/${lesson.id}`);
    setDropdownOpen(false);
  };
  const downloadPDF = () => {
    if (currentLesson?.pdfUrl) {
      window.open(currentLesson.pdfUrl, '_blank');
    }
  };
  const goToMonitoring = () => {
    navigate(`/kids-monitoring/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="children-page-container">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="content-layout-wrapper">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className={`primary-content-area ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            <div className="kids-loading-state">
              <div className="loading-circle-animation"></div>
              <p className="loading-status-text">Загружаем весёлые уроки...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="children-page-container">
        <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="content-layout-wrapper">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className={`primary-content-area ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            <div className="error-notification-box">
              <p>{error}</p>
              <button className="reload-action-button" onClick={() => window.location.reload()}>
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="children-page-container">
      <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      
      <div className="content-layout-wrapper">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className={`primary-content-area ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
          <div className="kids-learning-module animated-fade-in">
            <div className="header-controls-row animated-slide-down">
              <div className="score-monitor-column">
                <div className="score-tracker-widget hover-scale">
                  <button 
                    onClick={goToMonitoring} 
                    className="btn btn-success score-monitor-link"
                  >
                    <i className="fa fa-check" aria-hidden="true"></i> Мониторинг Счета
                  </button>
                </div>
              </div>

              <div className="lesson-selector-column">
                <div className="lesson-header-section">
                  <div className="kids-zone-title-container">
                    <span className="kids-zone-heading animated-pop-in">Kid's World!</span>
                  </div>
                  <div className="children-lesson-selector-wrapper">
                    <button 
                      className="btn dropdown-toggle btn-purple lesson-selection-button hover-bg-darken"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      {selectedLesson} <i className="fa fa-chevron-down" aria-hidden="true"></i>
                    </button>
                    <ul 
                      className="lesson-options-list" 
                      style={{ display: dropdownOpen ? 'block' : 'none' }}
                    >
                      {lessons.map((lesson) => (
                        <li key={lesson.id} className="hover-bg-light">
                          <a href="#" onClick={(e) => {
                            e.preventDefault();
                            handleLessonChange(lesson);
                          }} title={lesson.title}>
                            <i className="fa fa-caret-right" aria-hidden="true"></i>&nbsp;
                            Урок {lesson.id}-{lesson.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pdf-action-column">
                <button 
                  onClick={downloadPDF} 
                  className="btn btn-info pdf-export-button hover-scale"
                  disabled={!currentLesson?.pdfUrl}
                >
                  <i className="fa fa-file-pdf-o" aria-hidden="true"></i> Print PDF
                </button>
              </div>
            </div>

            <div className="lesson-visual-row animated-fade-in-delay">
              {currentLesson?.imageUrl && (
                <img 
                  src={currentLesson.imageUrl} 
                  alt={currentLesson.title} 
                  className="lesson-preview-image scale-on-hover"
                />
              )}
            </div>

            <div className="begin-section animated-fade-in-delay">
              <img 
                src="https://winner.gfriend.com/Content/images/kids-main.png" 
                className="kids-main-visual scale-on-hover" 
                alt="Kid's World"
              />
              <div className="start-action-container">
                <a 
                  href={`/kids-lessons/${currentLesson?.id}/keywords`} 
                  className="btn btn-success begin-action-button hover-scale"
                >
                  <i className="fa fa-arrow-right" aria-hidden="true"></i> Начать Здесь <i className="fa fa-arrow-left" aria-hidden="true"></i>
                </a>
              </div>
            </div>

            <div className="quiz-section animated-fade-in">
              <div className="quiz-grid-layout">
                <div className="quiz-item-container hover-lift" onClick={() => startQuiz(1)}>
                  <div className="quiz-icon-circle">
                    <img 
                      src="https://winner.gfriend.com/Content/images/vc-but04.png" 
                      alt="Викторина 1" 
                      className="quiz-icon-image"
                    />
                  </div>
                  <div className="quiz-progress-tracker">
                    <div 
                      className="quiz-progress-indicator progress-animate" 
                      style={{ width: `${quizProgress.quiz1}%` }}
                    >
                      <span className="quiz-progress-value">{quizProgress.quiz1}%</span>
                    </div>
                  </div>
                  <div className="quiz-label">Викторина #1</div>
                </div>

                <div className="quiz-item-container hover-lift" onClick={() => startQuiz(2)}>
                  <div className="quiz-icon-circle">
                    <img 
                      src="https://winner.gfriend.com/Content/images/vc-but05.png" 
                      alt="Викторина 2" 
                      className="quiz-icon-image"
                    />
                  </div>
                  <div className="quiz-progress-tracker">
                    <div 
                      className="quiz-progress-indicator progress-animate" 
                      style={{ width: `${quizProgress.quiz2}%` }}
                    >
                      <span className="quiz-progress-value">{quizProgress.quiz2}%</span>
                    </div>
                  </div>
                  <div className="quiz-label">Викторина #2</div>
                </div>

                <div className="quiz-item-container hover-lift" onClick={() => startQuiz(3)}>
                  <div className="quiz-icon-circle">
                    <img 
                      src="https://winner.gfriend.com/Content/images/vc-but06.png" 
                      alt="Викторина 3" 
                      className="quiz-icon-image"
                    />
                  </div>
                  <div className="quiz-progress-tracker">
                    <div 
                      className="quiz-progress-indicator progress-animate" 
                      style={{ width: `${quizProgress.quiz3}%` }}
                    >
                      <span className="quiz-progress-value">{quizProgress.quiz3}%</span>
                    </div>
                  </div>
                  <div className="quiz-label">Викторина #3</div>
                </div>

                <div className="quiz-item-container hover-lift" onClick={() => startQuiz(4)}>
                  <div className="quiz-icon-circle">
                    <img 
                      src="https://winner.gfriend.com/Content/images/vc-but07.png" 
                      alt="Викторина 4" 
                      className="quiz-icon-image"
                    />
                  </div>
                  <div className="quiz-progress-tracker">
                    <div 
                      className="quiz-progress-indicator progress-animate" 
                      style={{ width: `${quizProgress.quiz4}%` }}
                    >
                      <span className="quiz-progress-value">{quizProgress.quiz4}%</span>
                    </div>
                  </div>
                  <div className="quiz-label">Викторина #4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KidsLessonsPage;