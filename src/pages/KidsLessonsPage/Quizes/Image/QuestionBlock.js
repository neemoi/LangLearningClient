import React from 'react';
import { FaVolumeUp, FaCheck, FaTimes } from 'react-icons/fa';

const QuestionBlock = ({ 
  question, 
  options, 
  selectedAnswer, 
  showCorrect, 
  handleAnswerSelect,
  timeLeft,
  speakWord
}) => {
  return (
    <>
      <h3 className="image-quiz-question-prompt">Выбери правильное слово для изображения</h3>
      
      <div className="image-quiz-timer">
        Осталось: {timeLeft} сек
      </div>
      
      <div className="image-quiz-question-content">
        <div className="image-quiz-question-image-container">
          <div className="image-quiz-question-image">
            <img src={question.imageUrl} alt="Question" />
          </div>
          <button 
            className="image-quiz-speak-button"
            onClick={() => {
              const correctOption = options.find(opt => opt.isCorrect);
              if (correctOption) speakWord(correctOption.word);
            }}
          >
            <FaVolumeUp /> Озвучить
          </button>
        </div>
        
        <div className="image-quiz-text-options">
          {options.map((word) => (
            <div 
              key={word.id}
              className={`image-quiz-text-option ${
                selectedAnswer === word.id 
                  ? word.isCorrect ? 'correct' : 'wrong'
                  : showCorrect && word.isCorrect ? 'timeout' : ''
              }`}
              onClick={() => !selectedAnswer && handleAnswerSelect(word)}
            >
              <div className="image-quiz-option-content">
                {word.word}
                {(selectedAnswer || showCorrect) && (
                  <div className="image-quiz-answer-feedback">
                    {word.isCorrect ? (
                      <FaCheck className="image-quiz-correct-icon" />
                    ) : (
                      <FaTimes className="image-quiz-wrong-icon" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default QuestionBlock;