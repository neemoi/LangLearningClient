import React from 'react';
import { FaPlay } from 'react-icons/fa';

const StartScreen = ({ lessonTitle, onStart }) => {
  return (
    <div className="audio-quiz-start-screen">
      <p>Тест на прослушивание аудио и выбор правильного ответа</p>
      <button className="audio-quiz-start-button" onClick={onStart}>
        <FaPlay /> Начать тест
      </button>
    </div>
  );
};

export default StartScreen;