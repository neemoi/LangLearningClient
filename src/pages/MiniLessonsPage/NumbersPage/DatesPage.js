import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPlay, FaPause, FaArrowLeft } from 'react-icons/fa';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/DatesPage.css';

const DatesPage = () => {
  const navigate = useNavigate();
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
    { path: "/numbers/accounting", name: "Счет" },
    { path: "/numbers/dates", name: "Даты" },
    { path: "/numbers/math", name: "Математика" },
    { path: "/numbers/money", name: "Деньги" },
    { path: "/numbers/ordinal", name: "Порядковые числительные" },
    { path: "/numbers/time", name: "Время" }
  ];

  const datesGroups = [
    {
      title: "Порядковые числительные",
      btnClass: "group-1",
      items: [
        { value: "1st", text: "first" },
        { value: "2nd", text: "second" },
        { value: "3rd", text: "third" },
        { value: "4th", text: "fourth" },
        { value: "5th", text: "fifth" },
        { value: "6th", text: "sixth" },
        { value: "7th", text: "seventh" },
        { value: "8th", text: "eighth" },
        { value: "9th", text: "ninth" },
        { value: "10th", text: "tenth" },
        { value: "11th", text: "eleventh" },
        { value: "12th", text: "twelfth" },
        { value: "13th", text: "thirteenth" },
        { value: "14th", text: "fourteenth" },
        { value: "15th", text: "fifteenth" },
        { value: "16th", text: "sixteenth" },
        { value: "17th", text: "seventeenth" },
        { value: "18th", text: "eighteenth" },
        { value: "19th", text: "nineteenth" },
        { value: "20th", text: "twentieth" },
        { value: "21st", text: "twenty-first" },
        { value: "22nd", text: "twenty-second" },
        { value: "23rd", text: "twenty-third" },
        { value: "24th", text: "twenty-fourth" },
        { value: "25th", text: "twenty-fifth" },
        { value: "26th", text: "twenty-sixth" },
        { value: "27th", text: "twenty-seventh" },
        { value: "28th", text: "twenty-eighth" },
        { value: "29th", text: "twenty-ninth" },
        { value: "30th", text: "thirtieth" },
        { value: "31st", text: "thirty-first" }
      ]
    },
    {
      title: "Месяцы",
      btnClass: "group-2",
      items: [
        { value: "January", text: "January" },
        { value: "February", text: "February" },
        { value: "March", text: "March" },
        { value: "April", text: "April" },
        { value: "May", text: "May" },
        { value: "June", text: "June" },
        { value: "July", text: "July" },
        { value: "August", text: "August" },
        { value: "September", text: "September" },
        { value: "October", text: "October" },
        { value: "November", text: "November" },
        { value: "December", text: "December" }
      ]
    },
    {
      title: "Дни недели",
      btnClass: "group-3",
      items: [
        { value: "Monday", text: "Monday" },
        { value: "Tuesday", text: "Tuesday" },
        { value: "Wednesday", text: "Wednesday" },
        { value: "Thursday", text: "Thursday" },
        { value: "Friday", text: "Friday" },
        { value: "Saturday", text: "Saturday" },
        { value: "Sunday", text: "Sunday" }
      ]
    },
    {
      title: "Примеры дат",
      btnClass: "group-4",
      items: [
        { value: "Mon. Jan. 1st, 2003", text: "Monday, January first, twenty twenty-three" },
        { value: "Sat. Apr. 22nd, 1996", text: "Saturday, April twenty-second, nineteen ninety-six" },
        { value: "Wed. June 16th, 1955", text: "Wednesday, June sixteenth, nineteen fifty-five" }
      ]
    },
    {
      title: "Даты без года",
      btnClass: "group-5",
      items: [
        { value: "Tue. Mar. 26th", text: "Tuesday, March twenty-sixth" },
        { value: "Thu. Oct. 19th", text: "Thursday, October nineteenth" },
        { value: "Sat. Aug. 30th", text: "Saturday, August thirtieth" }
      ]
    },
    {
      title: "Месяц и день",
      btnClass: "group-6",
      items: [
        { value: "Dec. 25th", text: "December twenty-fifth" },
        { value: "May 1st", text: "May first" },
        { value: "Nov. 22nd", text: "November twenty-second" }
      ]
    },
    {
      title: "День и месяц",
      btnClass: "group-7",
      items: [
        { value: "Jan. 1st", text: "The first of January" },
        { value: "Sep. 13th", text: "The thirteenth of September" },
        { value: "Apr. 22nd", text: "The twenty-second of April" }
      ]
    },
    {
      title: "Только день",
      btnClass: "group-8",
      items: [
        { value: "6th", text: "the sixth" },
        { value: "12th", text: "the twelfth" },
        { value: "27th", text: "the twenty-seventh" }
      ]
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
    setShowDropdown(!showDropdown);
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
              <button onClick={handleBack} className="back-btn">
                <FaArrowLeft /> Назад к числам
              </button>
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
                  <Link to="/dates-text">
                    <div className="btn btn-xs btn-primary pull-right">
                      Показать текст
                    </div>
                  </Link>
                  <h4 className="header text-slim blue">
                    <span className="notranslate">Examples /</span> Примеры:
                  </h4>
                  <p className="notranslate">
                    {Array.from({length: 31}, (_, i) => i + 1).map(num => {
                      let suffix = 'th';
                      if (num === 1 || num === 21 || num === 31) suffix = 'st';
                      else if (num === 2 || num === 22) suffix = 'nd';
                      else if (num === 3 || num === 23) suffix = 'rd';
                      
                      return (
                        <button
                          key={num}
                          className="btn btn-danger mykeyword customplay"
                          style={{marginBottom: '3px', width: '75px'}}
                          onClick={() => speakItem({
                            value: `${num}${suffix}`,
                            text: `${num}${suffix}`
                          })}
                        >
                          {num}{suffix}
                        </button>
                      );
                    })}
                    <button 
                      style={{marginBottom: '3px'}} 
                      className="btn btn-success autoplaykeyword"
                      onClick={() => speakGroup(datesGroups[0])}
                    >
                      <FaPlay /> Play All
                    </button>
                  </p>
                  <br />
                  <h4 className="header text-slim orange">
                    <span className="notranslate">Months</span> / Месяцы
                  </h4>
                  <p>
                    {datesGroups[1].items.map((month, index) => (
                      <button
                        key={index}
                        className="btn btn-info monthnamekeyword customplay"
                        style={{marginBottom: '3px', width: '145px'}}
                        onClick={() => speakItem(month)}
                      >
                        <span className="notranslate">{month.value}</span><br />
                        {month.value}
                      </button>
                    ))}
                    <button 
                      style={{marginBottom: '3px'}} 
                      className="btn btn-success autoplaymonthname"
                      onClick={() => speakGroup(datesGroups[1])}
                    >
                      <FaPlay /> Play All
                    </button>
                  </p>
                  <br />
                  <h4 className="header text-slim green">
                    <span className="notranslate">Days</span> / Дни
                  </h4>
                  <p>
                    {datesGroups[2].items.map((day, index) => (
                      <button
                        key={index}
                        className="btn btn-warning weekdayskeyword customplay"
                        style={{marginBottom: '3px', width: '100px'}}
                        onClick={() => speakItem(day)}
                      >
                        <span className="notranslate">{day.value}</span><br />
                        {day.value}
                      </button>
                    ))}
                    <button 
                      style={{marginBottom: '3px'}} 
                      className="btn btn-success autoplayweekname"
                      onClick={() => speakGroup(datesGroups[2])}
                    >
                      <FaPlay /> Play All
                    </button>
                  </p>
                  <br />
                  <h4 className="header text-slim red">
                    <span className="notranslate">Examples /</span> Примеры:
                  </h4>
                  <p className="notranslate">
                    {datesGroups[3].items.map((date, index) => (
                      <button
                        key={index}
                        className="btn btn-success customplay"
                        style={{marginBottom: '3px'}}
                        onClick={() => speakItem(date)}
                      >
                        {date.value}
                      </button>
                    ))}
                  </p>
                  <br />
                  <h4 className="header text-slim purple">
                    <span className="notranslate">Examples /</span> Примеры:
                  </h4>
                  <p className="notranslate">
                    {datesGroups[4].items.map((date, index) => (
                      <button
                        key={index}
                        className="btn btn-primary customplay"
                        style={{marginBottom: '3px'}}
                        onClick={() => speakItem(date)}
                      >
                        {date.value}
                      </button>
                    ))}
                  </p>
                  <br />
                  <h4 className="header text-slim green">
                    <span className="notranslate">Examples /</span> Примеры:
                  </h4>
                  <p className="notranslate">
                    {datesGroups[5].items.map((date, index) => (
                      <button
                        key={index}
                        className="btn btn-danger customplay"
                        style={{marginBottom: '3px'}}
                        onClick={() => speakItem(date)}
                      >
                        {date.value}
                      </button>
                    ))}
                  </p>
                  <br />
                  <h4 className="header text-slim blue">
                    <span className="notranslate">Examples /</span> Примеры:
                  </h4>
                  <p className="notranslate">
                    {datesGroups[6].items.map((date, index) => (
                      <button
                        key={index}
                        className="btn btn-warning customplay"
                        style={{marginBottom: '3px'}}
                        onClick={() => speakItem(date)}
                      >
                        {date.value}
                      </button>
                    ))}
                  </p>
                  <br />
                  <h4 className="header text-slim orange">
                    <span className="notranslate">Examples /</span> Примеры:
                  </h4>
                  <p className="notranslate">
                    {datesGroups[7].items.map((date, index) => (
                      <button
                        key={index}
                        className="btn btn-info customplay"
                        style={{marginBottom: '3px'}}
                        onClick={() => speakItem(date)}
                      >
                        {date.value}
                      </button>
                    ))}
                  </p>
                </div>
              </div>
            )}

            {!englishVoice && (
              <div className="voice-warning">
                Загрузка английского голоса... Пожалуйста, подождите.
              </div>
            )}

            <div className="dates-groups-container">
              {datesGroups.map((group, index) => (
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
        </div>
      </main>
    </div>
  );
};

export default DatesPage;