import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LessonsList from './LessonsList';
import LessonDetail from './details/LessonDetail';
import '../lessons/LessonDetail.css';

const LessonsManagement = ({ setError }) => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [localError, setLocalError] = useState(null);

  const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal  
      });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      setLocalError(null);
      const response = await fetchWithTimeout('https://localhost:7119/api/Lessons', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }
      
      setLessons(data);
    } catch (err) {
      console.error('Fetch lessons error:', err);
      setLocalError(err.message || 'Ошибка загрузки уроков');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLessonDetails = useCallback(async (id) => {
    try {
      setLoading(true);
      setLocalError(null);
      const response = await fetchWithTimeout(`https://localhost:7119/api/Lessons/${id}/detail`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid lesson data received');
      }
      
      setCurrentLesson(data);
    } catch (err) {
      console.error('Fetch lesson details error:', err);
      setLocalError(err.message || 'Ошибка загрузки деталей урока');
      setCurrentLesson(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (lessonId) {
        await fetchLessonDetails(lessonId);
      } else {
        await fetchLessons();
      }
    };

    if (isMounted) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [lessonId, fetchLessonDetails, fetchLessons]);

  if (loading && !currentLesson && !lessons.length) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (localError && !loading && (!currentLesson || !lessons.length)) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">
          {localError}
          <button 
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={lessonId ? () => fetchLessonDetails(lessonId) : fetchLessons}
          >
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  if (lessonId) {
    return currentLesson ? (
      <LessonDetail 
        lesson={currentLesson} 
        navigate={navigate} 
        setError={setLocalError}
        refreshData={() => fetchLessonDetails(lessonId)}
      />
    ) : (
      <div className="error-container">
        <div className="alert alert-warning">
          Урок не найден
          <button 
            className="btn btn-sm btn-outline-primary ms-3"
            onClick={() => navigate('/admin/lessons')}
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  return (
    <LessonsList 
      lessons={lessons}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      navigate={navigate}
      error={localError}
      setError={setLocalError}
      refreshData={fetchLessons}
    />
  );
};

export default LessonsManagement;