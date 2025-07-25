import React, { useEffect, useRef } from 'react';
import { FaVolumeUp, FaCheck, FaTimes } from 'react-icons/fa';

const QuestionBlock = ({ 
  question, 
  userAnswer,
  setUserAnswer,
  handleAnswerSubmit,
  timeLeft,
  speakWord,
  answerStatus,
  correctAnswer
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [question]);

  return (
    <>
      <h3 className="xq-question-prompt">Напишите предложение, описывающее изображение</h3>
      
      <div className="xq-timer">
        Осталось: {timeLeft} сек
      </div>
      
      <div className="xq-question-content">
        <div className="xq-question-image-container">
          <div className="xq-question-image">
            <img src={question.imageUrl} alt="Question" />
          </div>
          <button 
            className="xq-speak-button"
            onClick={() => speakWord(correctAnswer)}
          >
            <FaVolumeUp /> Озвучить ответ
          </button>
        </div>
        
        <div className={`xq-grammar-answer-form ${answerStatus ? 'answered' : ''}`}>
          <input
            type="text"
            ref={inputRef}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
            placeholder="Введите ваше предложение..."
            className={`xq-grammar-input ${answerStatus ? answerStatus : ''}`}
            disabled={answerStatus !== null}
          />
          <button 
            className={`xq-submit-grammar-button ${answerStatus ? answerStatus : ''}`}
            onClick={handleAnswerSubmit}
            disabled={answerStatus !== null || userAnswer.trim() === ''}
          >
            {answerStatus === 'correct' ? (
              <FaCheck className="xq-button-icon" />
            ) : answerStatus === 'wrong' ? (
              <FaTimes className="xq-button-icon" />
            ) : (
              'Проверить'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default QuestionBlock;