import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPlay, FaPause } from 'react-icons/fa';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/MoneyPage.css';

const MoneyPage = () => {
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

  const moneyItems = [
    {
      title: "Основные понятия",
      items: [
        { 
          value: "dollars", 
          text: "dollars", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Money/money07.jpg"
        },
        { 
          value: "cents", 
          text: "cents", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Money/money13.jpg"
        }
      ],
      btnClass: "group-1"
    },
    {
      title: "Купюры",
      items: [
        { 
          value: "$1.00", 
          text: "one dollar bill", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Money/money01.jpg"
        },
        { 
          value: "$5.00", 
          text: "five dollar bill", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Money/money02.jpg"
        },
        { 
          value: "$10.00", 
          text: "ten dollar bill", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Money/money03.jpg"
        },
        { 
          value: "$20.00", 
          text: "twenty dollar bill", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Money/money04.jpg"
        },
        { 
          value: "$50.00", 
          text: "fifty dollar bill", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Money/money05.jpg"
        },
        { 
          value: "$100.00", 
          text: "hundred dollar bill", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Money/money06.jpg"
        }
      ],
      btnClass: "group-2"
    },
    {
      title: "Монеты",
      items: [
        { 
          value: "$.01", 
          text: "penny", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Money/money08.jpg"
        },
        { 
          value: "$.05", 
          text: "nickel", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Money/money09.jpg"
        },
        { 
          value: "$.10", 
          text: "dime", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Money/money10.jpg"
        },
        { 
          value: "$.25", 
          text: "quarter", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Money/money11.jpg"
        },
        { 
          value: "$.50", 
          text: "half dollar", 
          image: "https://winner.gfriend.com/Content/media/images/Number/Money/money12.jpg"
        }
      ],
      btnClass: "group-3"
    },
    {
      title: "Примеры сумм",
      items: [
        { 
          value: "$1.25", 
          text: "one dollar and twenty-five cents", 
        },
        { 
          value: "$4.00", 
          text: "four dollars", 
        },
        { 
          value: "$57.50", 
          text: "fifty-seven dollars and fifty cents", 
        },
        { 
          value: "$106.72", 
          text: "one hundred six dollars and seventy-two cents", 
        }
      ],
      btnClass: "group-4"
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
    <div className="money-app">
      <Navigation
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`money-main-content ${sidebarOpen ? 'with-sidebar' : 'no-sidebar'}`}>
        <div className="money-page">
          <header className="money-header">
            <div className="header-container">
              <button onClick={handleBack} className="back-btn">← Назад к числам</button>
              <h1 className="header-title">Числа / Деньги</h1>
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

          <div className="money-container">
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
                    <span className="notranslate">The American money system works basically the same as any other money system, where different combinations of bills and coins will add up to a total.</span><br />
                    Американская денежная система работает так же, как и любая другая денежная система, где различные комбинации купюр и монет складываются в общую сумму.
                  </p>
                  <p>
                    <span className="notranslate">A total is almost always spoken using the words "dollars" and "cents".</span><br />
                    Общая сумма почти всегда произносится с использованием слов "dollars" и "cents".
                  </p>
                  <p>
                    <span className="notranslate">If you have no dollars, you would only use the word(s) "cent" (one cent) or "cents" (thirty-five cents).</span><br />
                    Если у вас нет долларов, вы используете только слово "cent" (один цент) или "cents" (тридцать пять центов).
                  </p>
                  <p>
                    <span className="notranslate">If you have no cents, you would only use word(s) "dollar" (one dollar) or "dollars" (one hundred dollars).</span><br />
                    Если у вас нет центов, вы используете только слово "dollar" (один доллар) или "dollars" (сто долларов).
                  </p>
                  <p>
                    <span className="notranslate">Review the examples below to become familiar with the American money pronunciation.</span><br />
                    Ознакомьтесь с примерами ниже, чтобы привыкнуть к американскому произношению денежных сумм.
                  </p>
                  <br />
                  <h4 className="header smaller lighter purple">
                    <span className="notranslate">Examples</span> / Примеры:
                  </h4>
                  <div className="info-money-grid">
                    {moneyItems.slice(0, 3).flatMap(group => group.items).map((item, i) => (
                      <button 
                        key={i}
                        className="btn btn-danger customplay"
                        onClick={() => speakItem(item)}
                      >
                        <span className="notranslate">{item.value}</span><br />
                        {item.text}
                      </button>
                    ))}
                    <button className="btn btn-success autoplay">
                      <FaPlay /> Play All
                    </button>
                  </div>
                  <br />
                  <p>
                    <span className="notranslate">When we pronounce a dollar and cent amount, we use the word "and" to connect them. Listen to the examples below to hear how they are pronounced.</span><br />
                    Когда мы произносим сумму в долларах и центах, мы используем слово "and" для их соединения. Прослушайте примеры ниже, чтобы услышать, как они произносятся.
                  </p>
                  <br />
                  <h4 className="header smaller lighter green">
                    <span className="notranslate">Examples</span> / Примеры:
                  </h4>
                  <div className="info-money-grid">
                    {moneyItems[3].items.map((item, i) => (
                      <button 
                        key={i}
                        className="btn btn-info customplay"
                        onClick={() => speakItem(item)}
                      >
                        <span className="notranslate">{item.value}</span><br />
                        {item.text}
                      </button>
                    ))}
                    <button className="btn btn-success autoplay">
                      <FaPlay /> Play All
                    </button>
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

            {moneyItems.map((group, index) => (
              <section key={index} className={`money-group ${group.btnClass}`}>
                <h2>{group.title}</h2>
                <div className="money-grid">
                  {group.items.map((item, i) => (
                    <div key={i} className="money-card">
                      {item.image && (
                        <img 
                          src={item.image} 
                          className="money-image" 
                          alt={item.text}
                        />
                      )}
                      <button
                        className={`money-btn ${activeItem === item.value ? 'active' : ''}`}
                        onClick={() => speakItem(item)}
                      >
                        <span className="money-value">{item.value}</span>
                        <span className="money-text">{item.text}</span>
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

export default MoneyPage;