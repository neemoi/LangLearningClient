import React, { useState, useEffect } from 'react';
import './css/LessonHeader.css';
import API_CONFIG from '../src/config';

const LessonHeader = ({ currentLesson, navigate }) => {
  const [stats, setStats] = useState({
    loading: true,
    learned: 0,
    total: 0,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!currentLesson?.id) {
        setStats({
          loading: false,
          learned: 0,
          total: 0,
          error: null
        });
        return;
      }

      try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user?.id) {
          setStats({
            loading: false,
            learned: 0,
            total: 0,
            error: 'Пользователь не авторизован'
          });
          return;
        }
        
        setStats(prev => ({ ...prev, loading: true, error: null }));
        
        const res = await fetch(
          `${API_CONFIG.BASE_URL}/api/UserProgress/word-stats/${user.id}/${currentLesson.id}`
        );
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        setStats({
          loading: false,
          learned: data.learnedWordsOverall || 0,
          total: data.totalWordsOverall || 0,
          error: null
        });
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        setStats({
          loading: false,
          learned: 0,
          total: 0,
          error: error.message
        });
      }
    };

    fetchData();
  }, [currentLesson?.id]);

  const progress = stats.total > 0 
    ? Math.min(100, (stats.learned / stats.total) * 100)
    : 0;

  const handleMonitoringClick = () => {
    if (currentLesson?.id) {
      navigate(`/monitoring/${currentLesson.id}`);
    }
  };

  return (
   <div className="lesson-header-container" style={{ marginTop: '10px', marginBottom: '-20px'}}>
      <div className="header-top-row">
        <div className="words-counter">
          <span className="learned-count">{stats.learned}</span>
          <span className="total-count">/{stats.total} Банк слов</span>
          {stats.error && (
            <span className="error-message"> ({stats.error})</span>
          )}
        </div>
        
        <div className="header-actions">
        <button 
            className="action-btn monitoring-btn"
            onClick={handleMonitoringClick}
            disabled={!currentLesson?.id || stats.loading}
            style={{ minWidth: '150px', color: 'black', backgroundColor: '#bbd1ff' }} 
          >
            <MonitoringIcon />
            <span>Мониторинг</span>
          </button>
          <button 
            className="action-btn pdf-btn"
            onClick={() => window.open(currentLesson?.pdfUrl, '_blank')}
            disabled={!currentLesson?.pdfUrl || stats.loading}
            style={{ minWidth: '150px', color: 'black', backgroundColor: '#fbc5c5'}}
          >
            <PDFIcon />
            <span>PDF</span>
          </button>
        </div>
      </div>
      
      <div className="progress-section">
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${progress}%`,
              opacity: stats.loading ? 0.5 : 1
            }}
            aria-valuenow={stats.learned}
            aria-valuemin="0"
            aria-valuemax={stats.total}
          >
            <div className="progress-tooltip">
              {stats.loading ? 'Загрузка...' : `${Math.round(progress)}% изучено`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MonitoringIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"/>
  </svg>
);

const PDFIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" 
          stroke="currentColor" 
          strokeWidth="1.8"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" 
          stroke="currentColor" 
          strokeWidth="1.8" 
          strokeLinecap="round"/>
  </svg>
);

export default LessonHeader;