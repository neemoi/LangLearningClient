import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPlay, FaPause } from 'react-icons/fa';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/DatesPage.css';

const DatesPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/'); 
      return;
    }
    
    try {
      const userData = JSON.parse(currentUser);
      if (!userData.token || (userData.tokenExpiry && userData.tokenExpiry < Date.now())) {
        localStorage.removeItem('currentUser');
        navigate('/');
      }
    } catch (e) {
      localStorage.removeItem('currentUser');
      navigate('/');
    }
  }, [navigate]);

  const [activeItem, setActiveItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [playingGroup, setPlayingGroup] = useState(null);
  const [englishVoice, setEnglishVoice] = useState(null);
  const isSpeakingRef = useRef(false);
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const sections = [
    { path: "/mini-lessons/numbers", name: "Дом" },
  ];

  const datesItems = [
  ];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const en = voices.find(v => v.lang.startsWith('en'));
      if (en) setEnglishVoice(en);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speakItem = (item) => {
    stopSpeaking();
    const utter = new SpeechSynthesisUtterance(item.text);
    utter.voice = englishVoice;
    utter.rate = 0.9;
    setActiveItem(item.value);
    utter.onend = () => setActiveItem(null);
    window.speechSynthesis.speak(utter);
  };

  const speakGroup = async (group) => {
    if (!englishVoice) {
      alert("Английский голос не загружен.");
      return;
    }

    if (isSpeakingRef.current) {
      stopSpeaking();
      return;
    }

    isSpeakingRef.current = true;
    setPlayingGroup(group.title);

    for (const item of group.items) {
      if (!isSpeakingRef.current) break;

      const utter = new SpeechSynthesisUtterance(item.text);
      utter.voice = englishVoice;
      utter.rate = 0.9;

      setActiveItem(item.value);

      await new Promise(resolve => {
        utter.onend = () => {
          setActiveItem(null);
          setTimeout(resolve, 500);
        };
        window.speechSynthesis.speak(utter);
      });
    }

    stopSpeaking();
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
    setPlayingGroup(null);
    setActiveItem(null);
  };

  const handleBack = () => navigate('/mini-lessons/numbers');

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dates-app">
      <Navigation
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`dates-main-content ${sidebarOpen ? 'with-sidebar' : 'no-sidebar'}`}>
        <div className="dates-page">
          <header className="dates-header">
            <div className="header-container">
              <button onClick={handleBack} className="back-btn">← Назад к числам</button>
              <h1 className="header-title">Числа / Даты</h1>
              <div className="section-dropdown" ref={dropdownRef}>
                <button onClick={toggleDropdown} className="dropdown-toggle">
                  Перейти к разделу {showDropdown ? '▲' : '▼'}
                </button>
                <div className={`dropdown-menu ${showDropdown ? 'show' : ''}`}>
                  {sections.map((section, index) => (
                    <Link
                      key={index}
                      to={section.path}
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      {section.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="dates-container">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="info-toggle-btn"
            >
              {showInfo ? 'Скрыть справочник' : 'Показать справочник'}
            </button>

            {showInfo && (
              <div className="info-panel">
                <div className="panel panel-body panel-opacity">
                </div>
              </div>
            )}

            {!englishVoice && (
              <div className="voice-warning">
                Загрузка английского голоса... Пожалуйста, подождите.
              </div>
            )}

            {datesItems.map((group, index) => (
              <section key={index} className={`dates-group ${group.btnClass}`}>
                <h2>{group.title}</h2>
                <div className="dates-grid">
                  {group.items.map((item, i) => (
                    <div key={i} className="dates-card">
                      <button
                        className={`dates-btn ${activeItem === item.value ? 'active' : ''}`}
                        onClick={() => speakItem(item)}
                      >
                        <span className="dates-value">{item.value}</span>
                        <span className="dates-text">{item.text}</span>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className={`play-all-btn ${playingGroup === group.title ? 'stop' : ''}`}
                  onClick={() => speakGroup(group)}
                  disabled={!englishVoice}
                >
                  {playingGroup === group.title ? (
                    <>
                      <FaPause /> Остановить
                    </>
                  ) : (
                    <>
                      <FaPlay /> Произнести все
                    </>
                  )}
                </button>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DatesPage;