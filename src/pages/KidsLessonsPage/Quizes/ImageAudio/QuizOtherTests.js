import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuizOtherTests = ({ lessonId }) => {
  const navigate = useNavigate();

  const tests = [
    {
      id: 1,
      name: "Картинки",
      icon: "https://winner.gfriend.com/Content/images/vc-but04.png",
      path: `/kids-lessons/${lessonId}/quiz-1`
    },
    {
      id: 2,
      name: "Аудио",
      icon: "https://winner.gfriend.com/Content/images/vc-but05.png",
      path: `/kids-lessons/${lessonId}/quiz-2`
    },
    {
      id: 3,
      name: "Комбо",
      icon: "https://winner.gfriend.com/Content/images/vc-but06.png",
      path: `/kids-lessons/${lessonId}/quiz-3`
    },
    {
      id: 4,
      name: "Правописание",
      icon: "https://winner.gfriend.com/Content/images/vc-but07.png",
      path: `/kids-lessons/${lessonId}/quiz-4`
    }
  ];

   return (
    <div className="ia-other-tests">
      <h4 className="ia-other-tests-title">Другие тесты:</h4>
      <div className="ia-other-tests-row">
        {tests.map(test => (
          <button 
            key={test.id}
            className="ia-other-test-button"
            onClick={() => navigate(test.path)}
          >
            <img src={test.icon} alt={test.name} className="ia-other-test-icon" />
            <span className="ia-other-test-label">{test.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizOtherTests;