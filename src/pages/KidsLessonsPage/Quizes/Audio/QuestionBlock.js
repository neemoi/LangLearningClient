import React from 'react';
import { FaVolumeUp, FaCheck, FaTimes } from 'react-icons/fa';

const QuestionBlock = ({ 
  question, 
  options, 
  selectedAnswer, 
  showCorrect, 
  handleAnswerSelect,
  speakWord,
  timeLeft
}) => {
  return (
    <>
      <h3 className="audio-quiz-question-prompt">Выбери правильный ответ для услышанного слова</h3>
      
      <div className="audio-quiz-timer">
        Осталось: {timeLeft} сек
      </div>

      <div className="audio-quiz-speak-button-container">
        <button 
          className="audio-quiz-speak-button"
          onClick={() => {
            const correctOption = options.find(opt => opt.isCorrect);
            if (correctOption) {
              speakWord(correctOption.word);
            }
          }}
        >
          <FaVolumeUp /> Повторить слово
        </button>
      </div>
      
      <div className="audio-quiz-options-grid">
        {options.map((word) => (
          <div 
            key={word.id}
            className={`audio-quiz-option ${
              selectedAnswer === word.id 
                ? word.isCorrect ? 'audio-quiz-option-correct' : 'audio-quiz-option-wrong'
                : showCorrect && word.isCorrect ? 'audio-quiz-option-timeout' : ''
            }`}
            onClick={() => !selectedAnswer && handleAnswerSelect(word)}
          >
            <div className="audio-quiz-option-image-wrapper">
              <div className="audio-quiz-option-content">
                {word.word}
              </div>
            </div>
            {(selectedAnswer || showCorrect) && (
              <div className="audio-quiz-option-feedback">
                {word.isCorrect ? (
                  <FaCheck className="audio-quiz-feedback-correct" />
                ) : (
                  <FaTimes className="audio-quiz-feedback-wrong" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default QuestionBlock;