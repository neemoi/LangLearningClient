import React, { useState, useEffect, useRef } from 'react';
import { YoutubeTranscript } from 'youtube-transcript';
import './../../pages/LessonsPage/LessonsPage.css';

const VideoModal = ({ videoUrl, onClose, subtitles }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const getVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getVideoId(videoUrl);

  const findCurrentSubtitle = (time) => {
    if (!subtitles || subtitles.length === 0) return '';
    return subtitles.find(s => time >= s.start && time <= s.end)?.text || '';
  };

  useEffect(() => {
    if (!videoId) return;

    const onPlayerReady = (event) => {
      intervalRef.current = setInterval(() => {
        const time = event.target.getCurrentTime();
        setCurrentTime(time);
        setCurrentSubtitle(findCurrentSubtitle(time));
      }, 500); 
    };

    const onPlayerStateChange = (event) => {
      if (event.data === window.YT.PlayerState.ENDED) {
        clearInterval(intervalRef.current);
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        playerRef.current = new window.YT.Player('youtube-player', {
          videoId: videoId,
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      };
    } else {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }

    return () => {
      clearInterval(intervalRef.current);
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        
        <div className="video-modal-content">
          <div className="video-player-container">
            {videoId ? (
              <div id="youtube-player"></div>
            ) : (
              <div className="video-placeholder">
                Неверная ссылка на видео
              </div>
            )}
          </div>
          
          <div className="subtitles-container">
            <h3>Субтитры</h3>
            <div className="subtitle-text">
              {subtitles?.length > 0 ? currentSubtitle || 'Субтитры появятся здесь...' : 'Субтитры недоступны'}
            </div>
            <div className="current-time">
              Текущее время: {Math.floor(currentTime)}s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LessonPractice = ({ currentLesson, navigateToWords, navigateToPhrases }) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [subtitles, setSubtitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchSubtitles = async (videoUrl) => {
    try {
      setLoading(true);
      setError(null);
      
      const videoId = getVideoId(videoUrl);
      if (!videoId) throw new Error('Неверный URL YouTube видео');

      const transcript = await YoutubeTranscript.fetchTranscript(videoUrl, {
        lang: 'ru'
      });

      const formattedSubtitles = transcript.map(item => ({
        start: item.offset / 1000,
        end: (item.offset + item.duration) / 1000,
        text: item.text
      }));

      setSubtitles(formattedSubtitles);
    } catch (err) {
      console.error('Ошибка загрузки субтитров:', err);
      setError('Не удалось загрузить субтитры. Возможно, они отключены для этого видео.');
      setSubtitles([]);
    } finally {
      setLoading(false);
    }
  };

  const openVideo = async () => {
    if (!currentLesson?.videoUrl) {
      setError('Ссылка на видео не указана');
      return;
    }
    
    setShowVideoModal(true);
    await fetchSubtitles(currentLesson.videoUrl);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSubtitles([]);
    setError(null);
  };

  return (
    <div className="lesson-right-section">
      <h4 className="practice-title">Практиковаться</h4>
      <div className="lesson-actions">
        <div 
          className={`action-icon ${!currentLesson?.videoUrl ? 'disabled' : ''}`} 
          onClick={openVideo}
        >
          <div className="icon-circle video-icon">
            <img 
              src="https://winner.gfriend.com/Content/images/vc-but01.png" 
              alt="Видео урока" 
              className="circle-icon-image"
            />
          </div>
          <span>Видео урока</span>
        </div>
        
        <div className="action-icon" onClick={navigateToWords}>
          <div className="icon-circle words-icon">
            <img 
              src="https://winner.gfriend.com/Content/images/vc-but02.png" 
              alt="Ключевые слова" 
              className="circle-icon-image"
            />
          </div>
          <span>Ключевые слова</span>
        </div>
        
        <div className="action-icon" onClick={navigateToPhrases}>
          <div className="icon-circle phrases-icon">
            <img 
              src="https://winner.gfriend.com/Content/images/vc-but03.png" 
              alt="Фразы урока" 
              className="circle-icon-image"
            />
          </div>
          <span>Фразы урока</span>
        </div>
      </div>

      {showVideoModal && (
        <VideoModal 
          videoUrl={currentLesson.videoUrl}
          onClose={closeVideoModal}
          subtitles={subtitles}
        />
      )}

      {loading && (
        <div className="loading-message">
          Загрузка субтитров...
        </div>
      )}

      {error && !showVideoModal && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default LessonPractice;