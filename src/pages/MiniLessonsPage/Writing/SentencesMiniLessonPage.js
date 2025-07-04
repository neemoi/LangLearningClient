import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/WordsMiniLessonsPage.css';

const SentencesMiniLessonPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNumber, setSelectedNumber] = useState('1');

  const numbers = [
    { char: '1', image: 'https://winner.gfriend.com/Content/media/images/Writing/Sentences/alphawrite_1.jpg' },
    { char: '2', image: 'https://winner.gfriend.com/Content/media/images/Writing/Sentences/alphawrite_2.jpg' },
    { char: '3', image: 'https://winner.gfriend.com/Content/media/images/Writing/Sentences/alphawrite_3.jpg' },
    { char: '4', image: 'https://winner.gfriend.com/Content/media/images/Writing/Sentences/alphawrite_4.jpg' },
    { char: '5', image: 'https://winner.gfriend.com/Content/media/images/Writing/Sentences/alphawrite_5.jpg' },
    { char: '6', image: 'https://winner.gfriend.com/Content/media/images/Writing/Sentences/alphawrite_6.jpg' },
    { char: '7', image: 'https://winner.gfriend.com/Content/media/images/Writing/Sentences/alphawrite_7.jpg' },
    { char: '8', image: 'https://winner.gfriend.com/Content/media/images/Writing/Sentences/alphawrite_8.jpg' },
    { char: '9', image: 'https://winner.gfriend.com/Content/media/images/Writing/Sentences/alphawrite_9.jpg' },
    { char: '10', image: 'https://winner.gfriend.com/Content/media/images/Writing/Sentences/alphawrite_10.jpg' }
  ];

  return (
    <div className="writing-words-page">
      <Navigation 
        isSidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`writing-words-main ${sidebarOpen ? 'with-sidebar' : 'without-sidebar'}`}>
        <div className="writing-words-container">
          <div className="writing-words-back">
            <Link to="/mini-lessons/writing" className="writing-words-back-btn">
              ← Назад к Написанию
            </Link>
          </div>

          <div className="writing-words-header">
            <h1 className="writing-words-title">Пропись цифр</h1>
            <p className="writing-words-subtitle">Выберите цифру для просмотра примеров написания</p>
          </div>

          <div className="writing-words-letters">
            {numbers.map((number, index) => (
              <button
                key={index}
                className={`writing-words-letter-btn ${selectedNumber === number.char ? 'active' : ''}`}
                onClick={() => setSelectedNumber(number.char)}
                style={{ 
                  width: number.char.length > 1 ? '50px' : '40px',
                  margin: '0 5px 10px 5px' 
                }}
              >
                {number.char}
              </button>
            ))}
          </div>

          <div className="writing-words-image-wrapper">
            <div className="writing-words-image-container">
              <img 
                src={numbers.find(n => n.char === selectedNumber)?.image} 
                alt={`Примеры написания цифры ${selectedNumber}`}
                className="writing-words-img"
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

export default SentencesMiniLessonPage;