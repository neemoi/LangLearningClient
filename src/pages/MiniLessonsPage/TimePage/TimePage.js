import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPlay, FaPause } from 'react-icons/fa';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/TimePage.css';

const TimePage = () => {
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

  const timeItems = [
    {
      title: "Основные понятия",
      items: [
        { 
          value: "clock", 
          text: "clock", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_01.jpg"
        },
        { 
          value: "seconds", 
          text: "seconds", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_02.jpg"
        },
        { 
          value: "minutes", 
          text: "minutes", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_03.jpg"
        },
        { 
          value: "hours", 
          text: "hours", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_04.jpg"
        }
      ],
      btnClass: "group-1"
    },
    {
      title: "Часы (o'clock)",
      items: [
        { 
          value: "1:00", 
          text: "one o'clock", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_08.jpg"
        },
        { 
          value: "2:00", 
          text: "two o'clock", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_09.jpg"
        },
        { 
          value: "3:00", 
          text: "three o'clock", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_10.jpg"
        },
        { 
          value: "4:00", 
          text: "four o'clock", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_11.jpg"
        },
        { 
          value: "5:00", 
          text: "five o'clock", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_12.jpg"
        },
        { 
          value: "6:00", 
          text: "six o'clock", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_13.jpg"
        }
      ],
      btnClass: "group-2"
    },
    {
      title: "AM/PM",
      items: [
        { 
          value: "10:15 AM", 
          text: "ten fifteen AM", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_20.jpg"
        },
        { 
          value: "10:15 PM", 
          text: "ten fifteen PM", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_21.jpg"
        }
      ],
      btnClass: "group-3"
    },
    {
      title: "Минуты",
      items: [
        { 
          value: ":00", 
          text: "o'clock", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_22.jpg"
        },
        { 
          value: ":05", 
          text: "o' five", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_23.jpg"
        },
        { 
          value: ":10", 
          text: "ten", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_24.jpg"
        },
        { 
          value: ":15", 
          text: "fifteen", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_25.jpg"
        },
        { 
          value: ":20", 
          text: "twenty", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_26.jpg"
        },
        { 
          value: ":25", 
          text: "twenty-five", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_27.jpg"
        },
        { 
          value: ":30", 
          text: "thirty", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_28.jpg"
        },
        { 
          value: ":35", 
          text: "thirty-five", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_29.jpg"
        },
        { 
          value: ":40", 
          text: "forty", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_30.jpg"
        },
        { 
          value: ":45", 
          text: "forty-five", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_31.jpg"
        },
        { 
          value: ":50", 
          text: "fifty", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_32.jpg"
        },
        { 
          value: ":55", 
          text: "fifty-five", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_33.jpg"
        }
      ],
      btnClass: "group-4"
    },
    {
      title: "Примеры времени",
      items: [
        { 
          value: "1:15", 
          text: "quarter past one", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_35.jpg"
        },
        { 
          value: "1:30", 
          text: "half past one", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_36.jpg"
        },
        { 
          value: "1:45", 
          text: "quarter til two", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_37.jpg"
        },
        { 
          value: "8:30", 
          text: "eight thirty", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_38.jpg"
        },
        { 
          value: "6:15", 
          text: "six fifteen", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_40.jpg"
        },
        { 
          value: "11:05", 
          text: "eleven oh five", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Time/time_43.jpg"
        }
      ],
      btnClass: "group-5"
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
    <div className="time-app">
      <Navigation
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`time-main-content ${sidebarOpen ? 'with-sidebar' : 'no-sidebar'}`}>
        <div className="time-page">
          <header className="time-header">
            <div className="header-container">
              <button onClick={handleBack} className="back-btn">← Назад к числам</button>
              <h1 className="header-title">Числа / Время</h1>
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

          <div className="time-container">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="info-toggle-btn"
            >
              {showInfo ? 'Скрыть справочник' : 'Показать справочник'}
            </button>

            {showInfo && (
              <div className="info-panel">
                <div className="panel panel-body panel-opacity">
                  <p>
                    <span className="notranslate">Telling time is the same in every language since time is universal. The only difference is the pronunciation of the numbers and some vocabulary.</span>
                    <br />
                    Время одинаково во всех языках, так как оно универсально. Единственная разница - в произношении чисел и некоторой лексике.
                  </p>
                  <p>
                    <span className="notranslate">Let's start by learning the parts of the clock and terminology.</span><br />
                    Давайте начнем с изучения частей часов и терминологии.
                  </p>
                  <p>
                    <button 
                      className="btn btn-warning customplay"
                      onClick={() => speakItem({ value: "clock", text: "clock" })}
                    >
                      <span className="notranslate">clock</span><br />
                      часы
                    </button>
                  </p>
                  <br />
                  <p>
                    <span className="notranslate">The clock consists of 3 hands that help us read the time:</span>
                    <br />
                    Часы состоят из 3 стрелок, которые помогают нам определять время:
                  </p>
                  <br />
                  <h4 className="header smaller lighter green">
                    <span className="notranslate">Examples</span> / Примеры:
                  </h4>
                  <div className="info-time-grid">
                    <button 
                      className="btn btn-danger customplay"
                      onClick={() => speakItem({ value: "second hand", text: "second hand" })}
                    >
                      <span className="notranslate">second hand</span><br />
                      секундная стрелка
                    </button>
                    <button 
                      className="btn btn-danger customplay"
                      onClick={() => speakItem({ value: "minute hand", text: "minute hand" })}
                    >
                      <span className="notranslate">minute hand</span><br />
                      минутная стрелка
                    </button>
                    <button 
                      className="btn btn-danger customplay"
                      onClick={() => speakItem({ value: "hour hand", text: "hour hand" })}
                    >
                      <span className="notranslate">hour hand</span><br />
                      часовая стрелка
                    </button>
                  </div>
                  <br />
                  <p>
                    <span className="notranslate">The second hand counts the seconds, the minute hand counts the minutes and the hour hand counts the hours.</span><br />
                    Секундная стрелка отсчитывает секунды, минутная стрелка - минуты, а часовая стрелка - часы.
                  </p>
                  <br />
                  <h4 className="header smaller lighter orange">
                    <span className="notranslate">Examples</span> / Примеры:
                  </h4>
                  <div className="info-time-grid">
                    <button 
                      className="btn btn-success customplay"
                      onClick={() => speakItem({ value: "seconds", text: "seconds" })}
                    >
                      <span className="notranslate">seconds</span><br />
                      секунды
                    </button>
                    <button 
                      className="btn btn-success customplay"
                      onClick={() => speakItem({ value: "minutes", text: "minutes" })}
                    >
                      <span className="notranslate">minutes</span><br />
                      минуты
                    </button>
                    <button 
                      className="btn btn-success customplay"
                      onClick={() => speakItem({ value: "hours", text: "hours" })}
                    >
                      <span className="notranslate">hours</span><br />
                      часы
                    </button>
                  </div>
                  <div className="clearfix"></div>
                  <br />
                  <p>
                    <span className="notranslate">When the hour hand is pointing at a certain number and the minute hand is pointed straight up at the number 12, you pronounce the number that the hour hand is pointing at and follow that with "o'clock".</span><br />
                    Когда часовая стрелка указывает на определенное число, а минутная стрелка направлена прямо вверх на цифру 12, вы произносите число, на которое указывает часовая стрелка, и добавляете "o'clock".
                  </p>
                  <br />
                  <h4 className="header smaller lighter purple">
                    <span className="notranslate">Examples</span> / Примеры:
                  </h4>
                  <div className="info-time-grid">
                    {timeItems[1].items.slice(0, 6).map((item, i) => (
                      <button 
                        key={i}
                        className="btn btn-info customplay"
                        onClick={() => speakItem(item)}
                      >
                        <span className="notranslate">{item.value}</span><br />
                        {item.text}
                      </button>
                    ))}
                  </div>
                  <br />
                  <p>
                    <span className="notranslate">When talking about time, you can use 12 hour and 24 hour clocks.</span><br />
                    Говоря о времени, вы можете использовать 12-часовой и 24-часовой форматы.
                  </p>
                  <p>
                    <span className="notranslate">Here, we teach the 12 hour system, which consists of AM (before noon) and PM (after noon).</span><br />
                    Здесь мы изучаем 12-часовую систему, которая состоит из AM (до полудня) и PM (после полудня).
                  </p>
                  <ul>
                    <li>
                      <span className="notranslate">AM is from 12:00 midnight to 11:59, before noon.</span><br />
                      AM - с 12:00 ночи до 11:59, до полудня.
                    </li>
                    <li>
                      <span className="notranslate">PM is from 12:00 in the afternoon to 11:59 after noon.</span><br />
                      PM - с 12:00 дня до 11:59 после полудня.
                    </li>
                  </ul>
                  <p>
                    <span className="notranslate">It is important that you get these correct when you are telling someone a specific time.</span><br />
                    Важно правильно использовать эти обозначения, когда вы сообщаете конкретное время.
                  </p>
                  <br />
                  <h4 className="header smaller lighter orange">
                    <span className="notranslate">Examples</span> / Примеры:
                  </h4>
                  <div className="info-time-grid">
                    {timeItems[2].items.map((item, i) => (
                      <button 
                        key={i}
                        className="btn btn-success customplay"
                        onClick={() => speakItem(item)}
                      >
                        <span className="notranslate">{item.value}</span><br />
                        {item.text}
                      </button>
                    ))}
                  </div>
                  <br />
                  <p>
                    <span className="notranslate">When pronouncing the time, you will usually say the hour first. This will be the number that the "hour hand" is pointing at. Then you will follow the hour with the number that the minute hand is pointing at.</span><br />
                    При произнесении времени вы обычно сначала называете час. Это будет число, на которое указывает часовая стрелка. Затем вы называете число, на которое указывает минутная стрелка.
                  </p>
                  <p>
                    <span className="notranslate">Below is a list of the minutes in multiples of 5.</span><br />
                    Ниже приведен список минут с шагом в 5.
                  </p>
                  <br />
                  <h4 className="header smaller lighter blue">
                    <span className="notranslate">Examples</span> / Примеры:
                  </h4>
                  <div className="info-time-grid">
                    {timeItems[3].items.map((item, i) => (
                      <button 
                        key={i}
                        className="btn btn-warning customplay"
                        onClick={() => speakItem(item)}
                      >
                        <span className="notranslate">{item.value}</span><br />
                        {item.text}
                      </button>
                    ))}
                  </div>
                  <br />
                  <p>
                    <span className="notranslate">We often use a few terms for telling someone the time. We divide the clock into 4 quarters - :00, :15, :30, and :45. When describing the time, you might hear the following terms.</span><br />
                    Мы часто используем несколько терминов для указания времени. Мы делим часы на 4 четверти - :00, :15, :30 и :45. При описании времени вы можете услышать следующие термины.
                  </p>
                  <br />
                  <h4 className="header smaller lighter purple">
                    <span className="notranslate">Examples</span> / Примеры:
                  </h4>
                  <div className="info-time-grid">
                    {timeItems[4].items.slice(0, 3).map((item, i) => (
                      <button 
                        key={i}
                        className="btn btn-danger customplay"
                        onClick={() => speakItem(item)}
                      >
                        <span className="notranslate">{item.value}</span><br />
                        {item.text}
                      </button>
                    ))}
                  </div>
                  <br />
                  <h4 className="header smaller lighter green">
                    <span className="notranslate">Examples</span> / Примеры:
                  </h4>
                  <div className="info-time-grid">
                    {timeItems[4].items.slice(3).map((item, i) => (
                      <button 
                        key={i}
                        className="btn btn-primary customplay"
                        onClick={() => speakItem(item)}
                      >
                        <span className="notranslate">{item.value}</span><br />
                        {item.text}
                      </button>
                    ))}
                  </div>
                  <div className="space-24"></div>
                </div>
              </div>
            )}

            {!englishVoice && (
              <div className="voice-warning">
                Загрузка английского голоса... Пожалуйста, подождите.
              </div>
            )}

            {timeItems.map((group, index) => (
              <section key={index} className={`time-group ${group.btnClass}`}>
                <h2>{group.title}</h2>
                <div className="time-grid">
                  {group.items.map((item, i) => (
                    <div key={i} className="time-card">
                      {item.image && (
                        <img 
                          src={item.image} 
                          className="time-image" 
                          alt={item.text}
                        />
                      )}
                      <button
                        className={`time-btn ${activeItem === item.value ? 'active' : ''}`}
                        onClick={() => speakItem(item)}
                      >
                        <span className="time-value">{item.value}</span>
                        <span className="time-text">{item.text}</span>
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

export default TimePage;