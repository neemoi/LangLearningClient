import React from 'react';
import { FaPlay } from 'react-icons/fa';

const QuizStartScreen = ({ onStart }) => {
  return (
    <div className="ia-start-screen">
      <p>Тест на сопоставление картинок и аудио (Комбо)</p>
      <button className="ia-start-button" onClick={onStart}>
        <FaPlay /> Начать тест
      </button>
    </div>
  );
};

export default QuizStartScreen;