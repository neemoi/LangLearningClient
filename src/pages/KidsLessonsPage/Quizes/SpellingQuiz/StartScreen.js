import React from 'react';
import { FaPlay } from 'react-icons/fa';

const StartScreen = ({ lessonTitle, onStart }) => {
  return (
    <div className="xq-start-screen">
      <p>Тест на грамматику. Напишите предложение, описывающее изображение.</p>
      <button className="xq-start-button" onClick={onStart}>
        <FaPlay /> Начать тест
      </button>
    </div>
  );
};

export default StartScreen;