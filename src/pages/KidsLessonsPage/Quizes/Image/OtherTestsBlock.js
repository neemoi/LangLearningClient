import React from 'react';
import { useNavigate } from 'react-router-dom';

const OtherTestsBlock = ({ lessonId }) => {
  const navigate = useNavigate();

  return (
    <div className="image-quiz-types-container">
      <h4>Другие тесты:</h4>
      <div className="image-quiz-types-grid">
        <div className="image-quiz-type-card" onClick={() => navigate(`/kids-lessons/${lessonId}/quiz-1`)}>
          <div className="image-quiz-icon">
            <img src="https://winner.gfriend.com/Content/images/vc-but04.png" alt="Картинки" />
          </div>
          <div className="image-quiz-label">Картинки</div>
        </div>
        <div className="image-quiz-type-card" onClick={() => navigate(`/kids-lessons/${lessonId}/quiz-2`)}>
          <div className="image-quiz-icon">
            <img src="https://winner.gfriend.com/Content/images/vc-but05.png" alt="Аудио" />
          </div>
          <div className="image-quiz-label">Аудио</div>
        </div>
        <div className="image-quiz-type-card" onClick={() => navigate(`/kids-lessons/${lessonId}/quiz-3`)}>
          <div className="image-quiz-icon">
            <img src="https://winner.gfriend.com/Content/images/vc-but06.png" alt="Картинки+Аудио" />
          </div>
          <div className="image-quiz-label">Комбо</div>
        </div>
        <div className="image-quiz-type-card" onClick={() => navigate(`/kids-lessons/${lessonId}/quiz-4`)}>
          <div className="image-quiz-icon">
            <img src="https://winner.gfriend.com/Content/images/vc-but07.png" alt="Правописание" />
          </div>
          <div className="image-quiz-label">Правописание</div>
        </div>
      </div>
    </div>
  );
};

export default OtherTestsBlock;