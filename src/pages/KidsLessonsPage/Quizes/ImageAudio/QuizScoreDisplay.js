import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const AudiotestKidsScoreDisplay = ({ correctCount, wrongCount }) => {
  return (
    <div className="audiotestkids-score">
      <div className="audiotestkids-score-correct">
        <FaCheck /> {correctCount}
      </div>
      <div className="audiotestkids-score-wrong">
        <FaTimes /> {wrongCount}
      </div>
    </div>
  );
};

export default AudiotestKidsScoreDisplay;