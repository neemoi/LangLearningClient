import React, { useState } from 'react';
import { Table, Badge, Dropdown } from 'react-bootstrap';
import { FaInfoCircle, FaFilter } from 'react-icons/fa';
import './QuizQuestions.css';

const QuizQuestions = ({ questions }) => {
  const [filterType, setFilterType] = useState('ALL');

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-4">
        <FaInfoCircle size={24} className="text-muted mb-2" />
        <div className="text-muted">Нет вопросов в этом тесте</div>
      </div>
    );
  }

  const filteredQuestions = questions.filter(question => {
    if (filterType === 'ALL') return true;
    return question.questionType === filterType;
  });

  const getQuestionTypeName = (type) => {
    return type.toLowerCase()
      .replace('_', ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="quiz-questions-container">
      <div className="mb-3 d-flex justify-content-end">
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" size="sm">
            <FaFilter className="me-2" />
            {filterType === 'ALL' ? 'Все типы' : getQuestionTypeName(filterType)}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setFilterType('ALL')}>Все типы</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setFilterType('MULTIPLE_CHOICE')}>
              Multiple Choice
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterType('TRUE_FALSE')}>
              True False
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterType('SHORT_ANSWER')}>
              Short Answer
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterType('IMAGE_CHOICE')}>
              Image Choice
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover className="mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Вопрос</th>
              <th>Тип</th>
              <th>Варианты ответов</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((question, index) => (
              <tr key={question.id || index}>
                <td>{index + 1}</td>
                <td>
                  <div className="fw-semibold">{question.questionText}</div>
                  {question.explanation && (
                    <div className="text-muted small mt-1">
                      <FaInfoCircle className="me-1" />
                      {question.explanation}
                    </div>
                  )}
                </td>
                <td>
                  <Badge 
                    bg={
                      question.questionType === 'MULTIPLE_CHOICE' ? 'primary' : 
                      question.questionType === 'TRUE_FALSE' ? 'warning' : 
                      question.questionType === 'SHORT_ANSWER' ? 'success' : 'info'
                    }
                    className="text-capitalize"
                  >
                    {getQuestionTypeName(question.questionType)}
                  </Badge>
                </td>
                <td>
                  <div className="answers-list">
                    {question.answers?.map(answer => (
                      <div 
                        key={answer.id} 
                        className={`answer-item ${answer.isCorrect ? 'correct-answer' : ''}`}
                      >
                        <span>{answer.answerText}</span>
                        {answer.isCorrect && (
                          <Badge bg="success" className="ms-2">Правильный</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default QuizQuestions;