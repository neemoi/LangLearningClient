import React from 'react';
import { FaPlay } from 'react-icons/fa';

const StartScreen = ({ lessonTitle, onStart }) => {
  return (
    <div className="image-quiz-start-screen">
      <p>Тест на сопоставление изображений с текстом</p>
      <button className="image-quiz-start-button" onClick={onStart}>
        <FaPlay /> Начать тест
      </button>
    </div>
  );
};

export default StartScreen;