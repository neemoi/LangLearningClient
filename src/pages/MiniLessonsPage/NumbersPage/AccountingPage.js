import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/AccountingPage.css';

const AccountingPage = () => {
  const navigate = useNavigate();
  const [activeNumber, setActiveNumber] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [playingGroupTitle, setPlayingGroupTitle] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [englishVoice, setEnglishVoice] = useState(null);
  const isSpeakingRef = useRef(false);
  const dropdownRef = useRef(null);

  const sections = [
    { path: "/mini-lessons/numbers", name: "Дом" },
    { path: "/numbers/accounting", name: "Счет" },
    { path: "/numbers/dates", name: "Даты" },
    { path: "/numbers/math", name: "Математика" },
    { path: "/numbers/money", name: "Деньги" },
    { path: "/numbers/ordinals", name: "Порядковые числительные" },
    { path: "/numbers/time", name: "Время" }
  ];

  const numberGroups = [
    {
      title: "Числа (0 - 10)",
      numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      btnClass: "group-0"
    },
    {
      title: "Числа (11 - 19)",
      numbers: [11, 12, 13, 14, 15, 16, 17, 18, 19],
      btnClass: "group-1"
    },
    {
      title: "Числа (20 - 90)",
      numbers: [20, 30, 40, 50, 60, 70, 80, 90],
      btnClass: "group-2"
    },
    {
      title: "Числа (100 - 1,000,000,000,000)",
      numbers: [100, 1000, 1000000, 1000000000, 1000000000000],
      btnClass: "group-3",
      formatted: true
    }
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

  const speakNumber = (number) => {
    stopSpeaking();
    const utter = new SpeechSynthesisUtterance(number.toString());
    utter.voice = englishVoice;
    utter.rate = 0.9;
    setActiveNumber(number);
    utter.onend = () => setActiveNumber(null);
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
    setPlayingGroupTitle(group.title);

    for (const number of group.numbers) {
      if (!isSpeakingRef.current) break;

      const utter = new SpeechSynthesisUtterance(number.toString());
      utter.voice = englishVoice;
      utter.rate = 0.9;

      setActiveNumber(number);

      await new Promise(resolve => {
        utter.onend = () => {
          setActiveNumber(null);
          setTimeout(resolve, 250); 
        };
        window.speechSynthesis.speak(utter);
      });
    }

    stopSpeaking();
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
    setPlayingGroupTitle(null);
    setActiveNumber(null);
  };

  const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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
    <div className="accounting-app">
      <Navigation
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`accounting-main-content ${sidebarOpen ? 'with-sidebar' : 'no-sidebar'}`}>
        <div className="accounting-page">
          <header className="accounting-header">
            <div className="header-container">
              <button onClick={handleBack} className="back-btn">← Назад к числам</button>
              <h1 className="header-title">Числа / Счет</h1>
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

          <div className="accounting-container">
            <div className="intro-card">
              <h2>Английская числовая система</h2>
              <p>Выучите всего 33 слова, чтобы считать до триллиона</p>
            </div>

            {!englishVoice && (
              <div className="voice-warning">
                Загрузка английского голоса... Пожалуйста, подождите.
              </div>
            )}

            {numberGroups.map((group, index) => (
              <section key={index} className={`accounting-group ${group.btnClass}`}>
                <h2>{group.title}</h2>
                <div className="numbers-grid">
                  {group.numbers.map(num => (
                    <div key={num} className="number-card">
                      <button
                        className={`number-btn ${activeNumber === num ? 'active' : ''}`}
                        onClick={() => speakNumber(num)}
                      >
                        {group.formatted ? formatNumber(num) : num}
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className={`play-all-btn ${playingGroupTitle === group.title ? 'stop' : ''}`}
                  onClick={() => speakGroup(group)}
                  disabled={!englishVoice}
                >
                  {playingGroupTitle === group.title ? '⏹ Остановить' : '▶ Произнести все'}
                </button>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountingPage;
