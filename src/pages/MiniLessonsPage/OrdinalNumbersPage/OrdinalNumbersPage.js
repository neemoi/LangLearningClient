import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPlay, FaPause } from 'react-icons/fa';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/OrdinalNumbersPage.css';

const OrdinalNumbersPage = () => {
  const navigate = useNavigate();
  const [activeNumber, setActiveNumber] = useState(null);
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

  const numberGroups = [
    {
      title: "Ordinal Numbers (1st - 19th)",
      numbers: [
        { value: "1st", text: "first", audio: "1.mp3" },
        { value: "2nd", text: "second", audio: "2.mp3" },
        { value: "3rd", text: "third", audio: "3.mp3" },
        { value: "4th", text: "fourth", audio: "4.mp3" },
        { value: "5th", text: "fifth", audio: "5.mp3" },
        { value: "6th", text: "sixth", audio: "6.mp3" },
        { value: "7th", text: "seventh", audio: "7.mp3" },
        { value: "8th", text: "eighth", audio: "8.mp3" },
        { value: "9th", text: "ninth", audio: "9.mp3" },
        { value: "10th", text: "tenth", audio: "10.mp3" },
        { value: "11th", text: "eleventh", audio: "11.mp3" },
        { value: "12th", text: "twelfth", audio: "12.mp3" },
        { value: "13th", text: "thirteenth", audio: "13.mp3" },
        { value: "14th", text: "fourteenth", audio: "14.mp3" },
        { value: "15th", text: "fifteenth", audio: "15.mp3" },
        { value: "16th", text: "sixteenth", audio: "16.mp3" },
        { value: "17th", text: "seventeenth", audio: "17.mp3" },
        { value: "18th", text: "eighteenth", audio: "18.mp3" },
        { value: "19th", text: "nineteenth", audio: "19.mp3" }
      ],
      btnClass: "group-1"
    },
    {
      title: "Ordinal Numbers (20th - 90th)",
      numbers: [
        { value: "20th", text: "twentieth", audio: "20.mp3" },
        { value: "30th", text: "thirtieth", audio: "30.mp3" },
        { value: "40th", text: "fortieth", audio: "40.mp3" },
        { value: "50th", text: "fiftieth", audio: "50.mp3" },
        { value: "60th", text: "sixtieth", audio: "60.mp3" },
        { value: "70th", text: "seventieth", audio: "70.mp3" },
        { value: "80th", text: "eightieth", audio: "80.mp3" },
        { value: "90th", text: "ninetieth", audio: "90.mp3" }
      ],
      btnClass: "group-2"
    },
    {
      title: "Ordinal Numbers (100th - 1,000,000,000,000th)",
      numbers: [
        { value: "100th", text: "one hundredth", audio: "100.mp3" },
        { value: "1,000th", text: "one thousandth", audio: "1000.mp3" },
        { value: "1,000,000th", text: "one millionth", audio: "1000000.mp3" },
        { value: "1,000,000,000th", text: "one billionth", audio: "1000000000.mp3" },
        { value: "1,000,000,000,000th", text: "one trillionth", audio: "1000000000000.mp3" }
      ],
      btnClass: "group-3"
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
    const utter = new SpeechSynthesisUtterance(number.text);
    utter.voice = englishVoice;
    utter.rate = 0.9;
    setActiveNumber(number.value);
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
    setPlayingGroup(group.title);

    for (const number of group.numbers) {
      if (!isSpeakingRef.current) break;

      const utter = new SpeechSynthesisUtterance(number.text);
      utter.voice = englishVoice;
      utter.rate = 0.9;

      setActiveNumber(number.value);

      await new Promise(resolve => {
        utter.onend = () => {
          setActiveNumber(null);
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
    setActiveNumber(null);
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
    <div className="ordinal-numbers-app">
      <Navigation
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`ordinal-numbers-main-content ${sidebarOpen ? 'with-sidebar' : 'no-sidebar'}`}>
        <div className="ordinal-numbers-page">
          <header className="ordinal-numbers-header">
            <div className="header-container">
              <button onClick={handleBack} className="back-btn">← Назад к числам</button>
              <h1 className="header-title">Числа / Порядковые числительные</h1>
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

          <div className="ordinal-numbers-container">
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
                    <span className="notranslate">Another important form of numbers is the ordinal form. These ordinal numbers help to tell the order of things in a set. Below is a list of each of the ordinal numbers that you must learn to be able to pronounce them all.</span><br />
                    Другой важной формой чисел являются порядковые числительные. Они помогают определить порядок вещей в наборе. Ниже приведен список порядковых числительных, которые вам нужно выучить.
                  </p>
                  <p>
                    <span className="notranslate">Looking at the first chart below, notice the difference between the first 3 numbers and the others.</span><br />
                    Посмотрите на первую таблицу ниже и обратите внимание на разницу между первыми 3 числами и остальными.
                  </p>
                  <p>
                    <span className="notranslate">first (1st), second (2nd) and third (3rd)</span><br />
                    first (1st), second (2nd) and third (3rd)
                  </p>
                  <p>
                    <span className="notranslate">Fourth (4th) through nineteenth (19th) all end with "th".</span><br />
                    От fourth (4th) до nineteenth (19th) все оканчиваются на "th".
                  </p>
                  <p>
                    <span className="notranslate">Most of the ordinal numbers (4th through 19th) simply have "th" added to the end of the regular number, but notice the spelling of 5th, 8th, 9th and 12th.</span><br />
                    Большинство порядковых числительных (с 4th по 19th) просто добавляют "th" в конец обычного числа, но обратите внимание на написание 5th, 8th, 9th и 12th.
                  </p>
                  <br />
                  <h4 className="header smaller lighter orange">
                    <span className="notranslate">Ordinal numbers</span> / Ordinal numbers (1st - 19th)
                  </h4>
                  <div className="info-numbers-grid">
                    {numberGroups[0].numbers.map((num, i) => (
                      <button 
                        key={i}
                        className="btn btn-primary customplay"
                        onClick={() => speakNumber(num)}
                      >
                        <span className="notranslate">{num.value}</span><br />
                        {num.text}
                      </button>
                    ))}
                    <button className="btn btn-success autoplay">
                      <FaPlay /> Play All
                    </button>
                  </div>
                  <br />
                  <p>
                    <span className="notranslate">From 20th through 90th (multiples of 10), you simply remove the "y" from the regular number and add "ieth".</span><br />
                    От 20th до 90th (кратные 10) вы просто удаляете "y" из обычного числа и добавляете "ieth".
                  </p>
                  <br />
                  <h4 className="header smaller lighter red">
                    <span className="notranslate">Ordinal Numbers</span> / Ordinal Numbers (20th - 90th)
                  </h4>
                  <div className="info-numbers-grid">
                    {numberGroups[1].numbers.map((num, i) => (
                      <button 
                        key={i}
                        className="btn btn-info customplay"
                        onClick={() => speakNumber(num)}
                      >
                        <span className="notranslate">{num.value}</span><br />
                        {num.text}
                      </button>
                    ))}
                    <button className="btn btn-success autoplay">
                      <FaPlay /> Play All
                    </button>
                  </div>
                  <br />
                  <p>
                    <span className="notranslate"><strong>Important note:</strong> No matter the combination, you will always pronounce each number normally and only use the ordinal pronunciation at the end.</span><br />
                    <strong>Важное примечание:</strong> Независимо от комбинации, вы всегда произносите каждое число как обычно и используете порядковое произношение только в конце.
                  </p>
                  <br />
                  <p>
                    <span className="notranslate">From 100th and above (multiples of 100), you simply add "th" to the end of the number.</span><br />
                    От 100th и выше (кратные 100) вы просто добавляете "th" в конец числа.
                  </p>
                  <br />
                  <h4 className="header smaller lighter purple">
                    <span className="notranslate">Ordinal Numbers</span> / Ordinal Numbers (100th - 1,000,000,000,000th)
                  </h4>
                  <div className="info-numbers-grid">
                    {numberGroups[2].numbers.map((num, i) => (
                      <button 
                        key={i}
                        className="btn btn-danger customplay"
                        onClick={() => speakNumber(num)}
                      >
                        <span className="notranslate">{num.value}</span><br />
                        {num.text}
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

            {numberGroups.map((group, index) => (
              <section key={index} className={`ordinal-numbers-group ${group.btnClass}`}>
                <h2>{group.title}</h2>
                <div className="numbers-grid">
                  {group.numbers.map((num, i) => (
                    <div key={i} className="number-card">
                      <button
                        className={`number-btn ${activeNumber === num.value ? 'active' : ''}`}
                        onClick={() => speakNumber(num)}
                      >
                        <span className="number-value">{num.value}</span>
                        <span className="number-text">{num.text}</span>
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

export default OrdinalNumbersPage;