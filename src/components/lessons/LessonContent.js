import React from 'react';

const LessonContent = ({ lessons, currentLesson, handleLessonChange }) => {
  return (
    <div className="lesson-left-section">
      <div className="lesson-selector">
        <select onChange={handleLessonChange} value={currentLesson?.id || ''}>
          {lessons.map(lesson => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title}
            </option>
          ))}
        </select>
      </div>

      {currentLesson && (
        <div className="lesson-description">
          <h3>{currentLesson.title}</h3>
          <p>{currentLesson.description}</p>
        </div>
      )}
    </div>
  );
};

export default LessonContent;