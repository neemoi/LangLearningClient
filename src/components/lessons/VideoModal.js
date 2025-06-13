import React, { useState, useEffect, useRef } from 'react';
import { YoutubeTranscript } from 'youtube-transcript';
import './VideoModal.css';

const VideoModal = ({ videoUrl, onClose }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [subtitles, setSubtitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const getVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getVideoId(videoUrl);

  const fetchSubtitles = async () => {
    try {
      setLoading(true);
      setError(null);
      
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

    fetchSubtitles();

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
          },
          playerVars: {
            'autoplay': 1,
            'controls': 1,
            'rel': 0,
            'showinfo': 0,
            'modestbranding': 1
          }
        });
      };
    } else {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        },
        playerVars: {
          'autoplay': 1,
          'controls': 1,
          'rel': 0,
          'showinfo': 0,
          'modestbranding': 1
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
    <div className="video-modal-overlay">
      <div className={`video-modal-container ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="video-modal-content">
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
          <button 
            className="fullscreen-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 16V8H16V16H8Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 20V16H8" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 20H16V16" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 4H16V8" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 4H8V8" stroke="currentColor" strokeWidth="2"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5V6" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 3H19V6" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 21H19V18" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 21H5V18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
          </button>
          
          <div className="video-header">
            <h3>Просмотр видеоурока</h3>
          </div>

          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Загрузка видео и субтитров...</p>
            </div>
          )}

          <div className="video-main-content">
            <div className="video-player-wrapper">
              {videoId ? (
                <div className="video-player">
                  <div id="youtube-player"></div>
                </div>
              ) : (
                <div className="video-error">
                  {error || 'Неверная ссылка на видео'}
                </div>
              )}
            </div>
            
            <div className="subtitles-wrapper">
              <div className="subtitles-header">
                <h4>Субтитры</h4>
                <div className="time-indicator">
                  Текущее время: {Math.floor(currentTime)}s
                </div>
              </div>
              
              <div className="subtitles-body">
                {loading ? (
                  <div className="subtitles-loading">Загрузка субтитров...</div>
                ) : error ? (
                  <div className="subtitles-error">{error}</div>
                ) : subtitles?.length > 0 ? (
                  <div className="current-subtitle">
                    {currentSubtitle || <span className="no-subtitle">Субтитры появятся здесь...</span>}
                  </div>
                ) : (
                  <div className="subtitles-unavailable">Субтитры недоступны</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;