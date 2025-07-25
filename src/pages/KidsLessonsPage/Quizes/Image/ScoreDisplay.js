import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const ScoreDisplay = ({ correctAnswers, wrongAnswers }) => {
  return (
    <div className="image-quiz-score-display">
      <div className="image-quiz-score correct">
        <FaCheck /> {correctAnswers}
      </div>
      <div className="image-quiz-score wrong">
        <FaTimes /> {wrongAnswers}
      </div>
    </div>
  );
};

export default ScoreDisplay;