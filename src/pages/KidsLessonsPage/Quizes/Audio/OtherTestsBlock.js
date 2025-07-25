import React from 'react';
import { useNavigate } from 'react-router-dom';

const OtherTestsBlock = ({ lessonId }) => {
  const navigate = useNavigate();

  return (
    <div className="audio-quiz-other-tests">
      <h4 className="audio-quiz-other-tests-title">Другие тесты:</h4>
      <div className="audio-quiz-other-tests-row">
        <div className="audio-quiz-other-test-button" onClick={() => navigate(`/kids-lessons/${lessonId}/quiz-1`)}>
          <img className="audio-quiz-other-test-icon" src="https://winner.gfriend.com/Content/images/vc-but04.png" alt="Картинки" />
          <span className="audio-quiz-other-test-label">Картинки</span>
        </div>
        <div className="audio-quiz-other-test-button" onClick={() => navigate(`/kids-lessons/${lessonId}/quiz-2`)}>
          <img className="audio-quiz-other-test-icon" src="https://winner.gfriend.com/Content/images/vc-but05.png" alt="Аудио" />
          <span className="audio-quiz-other-test-label">Аудио</span>
        </div>
        <div className="audio-quiz-other-test-button" onClick={() => navigate(`/kids-lessons/${lessonId}/quiz-3`)}>
          <img className="audio-quiz-other-test-icon" src="https://winner.gfriend.com/Content/images/vc-but06.png" alt="Картинки+Аудио" />
          <span className="audio-quiz-other-test-label">Комбо</span>
        </div>
        <div className="audio-quiz-other-test-button" onClick={() => navigate(`/kids-lessons/${lessonId}/quiz-4`)}>
          <img className="audio-quiz-other-test-icon" src="https://winner.gfriend.com/Content/images/vc-but07.png" alt="Правописание" />
          <span className="audio-quiz-other-test-label">Правописание</span>
        </div>
      </div>
    </div>
  );
};

export default OtherTestsBlock;