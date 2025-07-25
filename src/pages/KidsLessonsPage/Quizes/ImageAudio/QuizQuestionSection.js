import React from 'react';
import { FaVolumeUp, FaCheck, FaTimes } from 'react-icons/fa';

const QuizQuestionSection = ({ 
  options, 
  selectedAnswer, 
  showCorrect, 
  onAnswerSelect,
  onSpeakWord,
  timeLeft
}) => {
   return (
    <>
      <h3 className="ia-question-prompt">Выбери правильную картинку для услышанного слова</h3>
      
      <div className="ia-timer">
        Осталось: {timeLeft} сек
      </div>

      <div className="ia-speak-button-container">
        <button 
          className="ia-speak-button"
          onClick={() => {
            const correctOption = options.find(opt => opt.isCorrect);
            if (correctOption) {
              onSpeakWord(correctOption.word);
            }
          }}
        >
          <FaVolumeUp /> Повторить слово
        </button>
      </div>
      
      <div className="ia-options-grid">
        {options.map((word) => (
          <div 
            key={word.id}
            className={`ia-option ${
              selectedAnswer === word.id 
                ? word.isCorrect ? 'ia-option-correct' : 'ia-option-wrong'
                : showCorrect && word.isCorrect ? 'ia-option-timeout' : ''
            }`}
            onClick={() => !selectedAnswer && onAnswerSelect(word)}
          >
            <div className="ia-option-image-wrapper">
              <img src={word.imageUrl} alt={word.word} />
            </div>
            {(selectedAnswer || showCorrect) && (
              <div className="ia-option-feedback">
                {word.isCorrect ? (
                  <FaCheck className="ia-feedback-correct" />
                ) : (
                  <FaTimes className="ia-feedback-wrong" />
                )}
                <span>{word.word}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default QuizQuestionSection;