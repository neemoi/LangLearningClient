import React, { useState, useEffect } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/AlphabetPage.css';

const AlphabetPage = () => {
  const navigate = useNavigate();
  const { speak, cancel } = useSpeechSynthesis();
  const [activeLetter, setActiveLetter] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const uppercaseLetters = 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'.split(' ');
  const lowercaseLetters = 'a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(' ');
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const consonants = 'B C D F G H J K L M N P Q R S T V W X Y Z'.split(' ');

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        navigate('/');
      } else {
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [navigate]);

  const speakAlphabet = () => {
    cancel();
    let delay = 0;
    uppercaseLetters.forEach((letter) => {
      setTimeout(() => {
        setActiveLetter(letter);
        speak({ text: letter });
      }, delay);
      delay += 1500;
    });
    
    setTimeout(() => setActiveLetter(null), delay);
  };

  const speakLetter = (letter) => {
    cancel();
    setActiveLetter(letter);
    speak({ text: letter });
    setTimeout(() => setActiveLetter(null), 800);
  };

  if (!isAuthorized) {
    return null; 
  }

  return (
    <div className="abc-page">
      <Navigation 
        isSidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`abc-main ${sidebarOpen ? 'with-sidebar' : 'without-sidebar'}`}>
        <div className="abc-container">
          <div className="abc-back">
            <Link to="/lessonsVirtual/1" className="abc-back-btn">
              ← Вернуться к уроку
            </Link>
          </div>

          <div className="abc-header">
            <h1 className="abc-title">Английский алфавит</h1>
            <p className="abc-subtitle">Изучайте буквы с правильным произношением</p>
          </div>

          <div className="abc-actions">
            <button 
              onClick={speakAlphabet}
              className="abc-action-btn abc-play-all"
            >
              Прослушать весь алфавит
            </button>
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="abc-action-btn abc-info-btn"
            >
              {showInfo ? 'Скрыть подсказки' : 'Показать подсказки'}
            </button>
          </div>

          <div className="abc-grid">
            {uppercaseLetters.map((letter) => (
              <div 
                key={letter}
                className={`abc-letter-card ${activeLetter === letter ? 'active' : ''} ${
                  vowels.includes(letter) ? 'vowel' : 'consonant'
                }`}
                onClick={() => speakLetter(letter)}
              >
                <div className="abc-letter-content">
                  <div className="abc-uppercase">{letter}</div>
                  <div className="abc-lowercase">{letter.toLowerCase()}</div>
                </div>
              </div>
            ))}
          </div>

          {showInfo && (
            <div className="abc-info">
              <div className="abc-info-section abc-intro">
                <h2>Alphabet / Алфавит</h2>
                <p>The English alphabet consists of twenty six (26) letters.<br/>
                Английский алфавит состоит из двадцати шести (26) букв.</p>
              </div>

              <div className="abc-info-section">
                <h3>Uppercase letters / Прописные буквы</h3>
                <p>There are two forms of each letter: Uppercase and Lowercase.<br/>
                Есть две формы каждой буквы: прописные (верхний регистр) и строчные (нижний регистр).</p>
                <div className="abc-letters-display abc-uppercase-display">
                  {uppercaseLetters.join(' ')}
                </div>
              </div>

              <div className="abc-info-section">
                <h3>Lowercase letters / Строчные буквы</h3>
                <div className="abc-letters-display abc-lowercase-display">
                  {lowercaseLetters.join(' ')}
                </div>
              </div>

              <div className="abc-info-section">
                <h3>Vowels / Гласные</h3>
                <p>The alphabet is also separated into consonants and vowels. Six (6) vowels and twenty (20) consonants. Each word in the English language has at least one vowel.<br/>
                Алфавит также разделен на согласные и гласные. Шесть (6) гласных и двадцать (20) согласных. Каждое слово в английском языке имеет по крайней мере одну гласную букву.</p>
                <div className="abc-letters-display abc-vowel-display">
                  {vowels.join(' ')}<br/>
                  ({vowels.join(' ').toLowerCase()})
                </div>
              </div>

              <div className="abc-info-section">
                <h3>Consonants / Согласные</h3>
                <div className="abc-letters-display abc-consonant-display">
                  {consonants.join(' ')}<br/>
                  ({consonants.join(' ').toLowerCase()})
                </div>
                <div className="abc-note">
                  <p>*The letter "Y" is often also used as a vowel although sometimes it is used as a consonant.<br/>
                  * Буква "Y" чаще используется в качестве гласной, а иногда - в качестве согласной буквы.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AlphabetPage;