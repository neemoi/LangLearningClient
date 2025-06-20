import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/layout/Navigation/Navigation';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import LessonHeader from '../../components/lessons/LessonHeader';
import LessonContent from '../../components/lessons/LessonContent';
import LessonPractice from '../../components/lessons/LessonPractice';
import LessonQuizzes from '../../components/lessons/LessonQuizzes';
import API_CONFIG from '../../components/src/config';
import './LessonsPage.css';

const LessonsPage = () => {
  const { lessonId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(30);
  const [selectedTab, setSelectedTab] = useState('nouns');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
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
    setIsAuthenticated(authStatus);
    
    if (authStatus) {
      fetchLessons();
    } else {
      setLoading(false);
    }
  }, [navigate, lessonId]);

  const fetchLessons = async () => {
    try {
      const token = localStorage.getItem('userToken');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/Lessons`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();
      setLessons(data);
      
      const lessonToLoad = lessonId || (data.length > 0 ? data[0].id : null);
      if (lessonToLoad) {
        loadLesson(lessonToLoad);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLesson = async (lessonId) => {
    try {
      const token = localStorage.getItem('userToken');
      
      const lessonResponse = await fetch(`${API_CONFIG.BASE_URL}/api/Lessons/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (lessonResponse.status === 401) {
        handleUnauthorized();
        return;
      }

      const lessonData = await lessonResponse.json();
      setCurrentLesson(lessonData);

    } catch (error) {
      console.error('Error loading lesson data:', error);
    }
  };

  const handleUnauthorized = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userToken');
    navigate('/');
  };

  const handleLessonChange = (e) => {
    const newLessonId = e.target.value;
    navigate(`/lessonsVirtual/${newLessonId}`);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const startQuiz = (type) => {
    navigate(`/lessonsVirtual/${lessonId}/${type}-test`);
  };

  const navigateToWords = () => {
    navigate(`/lessonsVirtual/${currentLesson?.id}/words`);
  };

  const navigateToPhrases = () => {
    navigate(`/lessonsVirtual/${currentLesson?.id}/phrases`);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="lessons-page-wrapper">
        <Navigation 
          onToggleSidebar={toggleSidebar} 
          isSidebarOpen={sidebarOpen} 
        />
        <div className="content-wrapper">
          <Sidebar isOpen={sidebarOpen} />
          <Container fluid className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
            <div className="loading-message">
              <div className="spinner"></div>
              <p>Загрузка уроков...</p>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="lessons-page-wrapper">
      <Navigation 
        onToggleSidebar={toggleSidebar} 
        isSidebarOpen={sidebarOpen} 
      />
      
      <div className="content-wrapper">
        <Sidebar isOpen={sidebarOpen} />
        
        <Container fluid className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
          <LessonHeader 
            progress={progress} 
            currentLesson={currentLesson} 
            navigate={navigate} 
          />

          <div className="block block-2">
            <div className="lesson-content-container">
              <LessonContent 
                lessons={lessons} 
                currentLesson={currentLesson} 
                handleLessonChange={handleLessonChange} 
              />
              
              <LessonPractice 
                currentLesson={currentLesson}
                navigateToWords={navigateToWords}
                navigateToPhrases={navigateToPhrases}
              />
            </div>
          </div>
          <LessonQuizzes 
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            startQuiz={startQuiz}
            lessonId={lessonId}
          />
        </Container>
      </div>
    </div>
  );
};

export default LessonsPage;