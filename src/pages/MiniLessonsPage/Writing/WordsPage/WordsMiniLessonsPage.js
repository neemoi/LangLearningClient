import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../../components/layout/Sidebar/Sidebar';
import './../css/WordsMiniLessonsPage.css';

const WordsMiniLessonsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState('A');

  const letters = [
    { char: 'A', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_a.jpg' },
    { char: 'B', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_b.jpg' },
    { char: 'C', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_c.jpg' },
    { char: 'D', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_d.jpg' },
    { char: 'E', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_e.jpg' },
    { char: 'F', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_f.jpg' },
    { char: 'G', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_g.jpg' },
    { char: 'H', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_h.jpg' },
    { char: 'I-J', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_i.jpg' },
    { char: 'K-L', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_k.jpg' },
    { char: 'M', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_m.jpg' },
    { char: 'N', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_n.jpg' },
    { char: 'O', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_o.jpg' },
    { char: 'P', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_p.jpg' },
    { char: 'Q-R', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_q.jpg' },
    { char: 'S', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_s.jpg' },
    { char: 'T', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_t.jpg' },
    { char: 'U-Z', image: 'https://winner.gfriend.com/Content/media/images/Writing/Words/alphawrite_u.jpg' }
  ];

  return (
    <div className="words-page">
      <Navigation 
        isSidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`words-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="words-container">
          <div className="back-link">
            <Link to="/mini-lessons/writing" className="back-button">
              ← Назад к Написанию
            </Link>
          </div>

          <div className="header-section">
            <h1 className="words-title">Пропись слов</h1>
            <p className="words-subtitle">Выберите букву для просмотра примеров написания слов</p>
          </div>

          <div className="letters-container">
            {letters.map((letter, index) => (
              <button
                key={index}
                className={`letter-button ${selectedLetter === letter.char ? 'active' : ''}`}
                onClick={() => setSelectedLetter(letter.char)}
                style={{ 
                  width: letter.char.length > 1 ? '50px' : '40px',
                  margin: '0 5px 10px 5px' 
                }}
              >
                {letter.char}
              </button>
            ))}
          </div>

          <div className="image-wrapper">
            <div className="image-container">
              <img 
                src={letters.find(l => l.char === selectedLetter)?.image} 
                alt={`Примеры слов с буквой ${selectedLetter}`}
                className="writing-image"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WordsMiniLessonsPage;