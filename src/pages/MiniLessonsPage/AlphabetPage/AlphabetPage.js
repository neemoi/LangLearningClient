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
    <div className="alphabet-page">
      <Navigation 
        isSidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`alphabet-content ${sidebarOpen ? 'with-sidebar' : 'no-sidebar'}`}>
        <div className="alphabet-container">
          <div className="back-link">
            <Link to="/lessonsVirtual/1" className="back-button">
              ← Вернуться к уроку
            </Link>
          </div>

          <div className="header-section">
            <h1 className="alphabet-title">Английский алфавит</h1>
            <p className="alphabet-subtitle">Изучайте буквы с правильным произношением</p>
          </div>

          <div className="alphabet-actions">
            <button 
              onClick={speakAlphabet}
              className="action-button play-all"
            >
              Прослушать весь алфавит
            </button>
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="action-button info"
            >
              {showInfo ? 'Скрыть подсказки' : 'Показать подсказки'}
            </button>
          </div>

          <div className="alphabet-grid">
            {uppercaseLetters.map((letter) => (
              <div 
                key={letter}
                className={`letter-card ${activeLetter === letter ? 'active' : ''} ${
                  vowels.includes(letter) ? 'vowel' : 'consonant'
                }`}
                onClick={() => speakLetter(letter)}
              >
                <div className="letter-content">
                  <div className="uppercase">{letter}</div>
                  <div className="lowercase">{letter.toLowerCase()}</div>
                </div>
              </div>
            ))}
          </div>

          {showInfo && (
            <div className="alphabet-info">
              <div className="info-section intro">
                <h2>Alphabet / Алфавит</h2>
                <p>The English alphabet consists of twenty six (26) letters.<br/>
                Английский алфавит состоит из двадцати шести (26) букв.</p>
              </div>

              <div className="info-section">
                <h3>Uppercase letters / Прописные буквы</h3>
                <p>There are two forms of each letter: Uppercase and Lowercase.<br/>
                Есть две формы каждой буквы: прописные (верхний регистр) и строчные (нижний регистр).</p>
                <div className="letters-display uppercase">
                  {uppercaseLetters.join(' ')}
                </div>
              </div>

              <div className="info-section">
                <h3>Lowercase letters / Строчные буквы</h3>
                <div className="letters-display lowercase">
                  {lowercaseLetters.join(' ')}
                </div>
              </div>

              <div className="info-section">
                <h3>Vowels / Гласные</h3>
                <p>The alphabet is also separated into consonants and vowels. Six (6) vowels and twenty (20) consonants. Each word in the English language has at least one vowel.<br/>
                Алфавит также разделен на согласные и гласные. Шесть (6) гласных и двадцать (20) согласных. Каждое слово в английском языке имеет по крайней мере одну гласную букву.</p>
                <div className="letters-display vowel">
                  {vowels.join(' ')}<br/>
                  ({vowels.join(' ').toLowerCase()})
                </div>
              </div>

              <div className="info-section">
                <h3>Consonants / Согласные</h3>
                <div className="letters-display consonant">
                  {consonants.join(' ')}<br/>
                  ({consonants.join(' ').toLowerCase()})
                </div>
                <div className="note">
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