import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const ScoreDisplay = ({ correctAnswers, wrongAnswers }) => {
  return (
    <div className="xq-score-display">
      <div className="xq-score xq-correct">
        <FaCheck /> {correctAnswers}
      </div>
      <div className="xq-score xq-wrong">
        <FaTimes /> {wrongAnswers}
      </div>
    </div>
  );
};

export default ScoreDisplay;