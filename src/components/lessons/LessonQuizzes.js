import React, { useState } from 'react';
import './css/LessonQuizzes.css';

const LessonQuizzes = ({ startQuiz }) => {
  const [hoveredQuiz, setHoveredQuiz] = useState(null);

  const quizData = {
    nouns: [
      { id: 'image', icon: 'https://winner.gfriend.com/Content/images/vc-but04.png', tooltip: 'Тест по изображениям' },
      { id: 'audio', icon: 'https://winner.gfriend.com/Content/images/vc-but05.png', tooltip: 'Тест по звукозаписи' },
      { id: 'audio-image', icon: 'https://winner.gfriend.com/Content/images/vc-but06.png', tooltip: 'Тест: звук + изображение' },
      { id: 'spelling', icon: 'https://winner.gfriend.com/Content/images/vc-but07.png', tooltip: 'Тест на правописание' }
    ],
    grammar: [
      { id: 'grammar', icon: 'https://winner.gfriend.com/Content/images/vc-but08.png', tooltip: 'Грамматический тест' },
      { id: 'pronunciation', icon: 'https://winner.gfriend.com/Content/images/vc-but09.png', tooltip: 'Тест на произношение' },
      { id: 'advanced', icon: 'https://winner.gfriend.com/Content/images/vc-but10.png', tooltip: 'Продвинутый тест' }
    ]
  };

  return (
    <div className="quiz-main-container">
      <div className="quiz-columns-container">
        <div className="quiz-column left-column">
          <div className="quiz-category-block noun-block">
            <h3 className="category-title">Существительные</h3>
            <div className="quiz-items-container">
              {quizData.nouns.map((quiz) => (
                <QuizCircle 
                  key={quiz.id}
                  quiz={quiz}
                  hoveredQuiz={hoveredQuiz}
                  setHoveredQuiz={setHoveredQuiz}
                  startQuiz={startQuiz}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="quiz-column right-column">
          <div className="quiz-category-block grammar-block">
            <h3 className="category-title">Грамматика</h3>
            <div className="quiz-items-container">
              {quizData.grammar.map((quiz) => (
                <QuizCircle 
                  key={quiz.id}
                  quiz={quiz}
                  hoveredQuiz={hoveredQuiz}
                  setHoveredQuiz={setHoveredQuiz}
                  startQuiz={startQuiz}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuizCircle = ({ quiz, hoveredQuiz, setHoveredQuiz, startQuiz }) => (
  <div 
    className="quiz-item"
    onClick={() => startQuiz(quiz.id)}
    onMouseEnter={() => setHoveredQuiz(quiz.id)}
    onMouseLeave={() => setHoveredQuiz(null)}
  >
    <div className="quiz-circle">
      <img src={quiz.icon} alt="" className="quiz-image" />
    </div>
    {hoveredQuiz === quiz.id && (
      <div className="quiz-tooltip">{quiz.tooltip}</div>
    )}
  </div>
);

export default LessonQuizzes;