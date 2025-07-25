import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const ScoreDisplay = ({ correctAnswers, wrongAnswers }) => {
  return (
    <div className="audio-quiz-score">
      <div className="audio-quiz-score-correct">
        <FaCheck /> {correctAnswers}
      </div>
      <div className="audio-quiz-score-wrong">
        <FaTimes /> {wrongAnswers}
      </div>
    </div>
  );
};

export default ScoreDisplay;