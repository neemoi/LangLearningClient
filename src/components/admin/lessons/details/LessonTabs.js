import React, { useState } from 'react';
import { Tabs, Tab, Card, Accordion, Alert, Button} from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlusCircle, FaQuestionCircle } from 'react-icons/fa';
import QuizQuestions from '../quiz/QuizQuestions';


const LessonTabs = ({
  activeKey,
  setActiveKey,
  lesson,
  setShowWordAddModal,
  openWordEditModal,
  handleDeleteWord,
  setShowPhraseAddModal,
  openPhraseEditModal,
  handleDeletePhrase,
  setShowQuizAddModal,
  openQuizEditModal,
  handleDeleteQuiz,
}) => {
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  const toggleQuizQuestions = (quizId) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  const getQuizQuestions = (quizId) => {
    const quiz = lesson.quizzes?.find(q => q.id === quizId);
    return quiz?.questions || [];
  };

  return (
    <Tabs
      activeKey={activeKey}
      onSelect={(k) => setActiveKey(k)}
      className="lesson-tabs"
      fill
    >
      <Tab 
        eventKey="words" 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Слова ({lesson.words?.length || 0})</span>
            <Button 
              variant="link" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setShowWordAddModal(true);
              }}
            >
              <FaPlusCircle size={18} />
            </Button>
          </div>
        }
      >
        <div className="lesson-words">
          {lesson.words?.length > 0 ? (
            lesson.words.map(word => (
              <Card key={word.id} className="word-card mb-3">
                {word.imageUrl && (
                  <div className="word-image">
                    <img src={word.imageUrl} alt={word.name} onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                <Card.Body>
                  <Card.Title>{word.name}</Card.Title>
                  <Card.Text>{word.translation}</Card.Text>
                  <div className="word-actions mt-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => openWordEditModal(word)}
                      className="me-2"
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleDeleteWord(word.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))
          ) : (
            <Alert variant="info">Нет слов</Alert>
          )}
        </div>
      </Tab>

      <Tab 
        eventKey="phrases" 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Фразы ({lesson.phrases?.length || 0})</span>
            <Button 
              variant="link" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setShowPhraseAddModal(true);
              }}
            >
              <FaPlusCircle size={18} />
            </Button>
          </div>
        }
      >
        <Accordion>
          {lesson.phrases?.length > 0 ? (
            lesson.phrases.map((phrase, idx) => (
              <Accordion.Item eventKey={idx.toString()} key={phrase.id}>
                <Accordion.Header>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{phrase.phraseText}</span>
                    <div className="phrase-actions">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          openPhraseEditModal(phrase);
                        }}
                        className="me-2"
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhrase(phrase.id);
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <p><strong>Перевод:</strong> {phrase.translation}</p>
                  {phrase.imageUrl && (
                    <img
                      src={phrase.imageUrl}
                      alt={phrase.phraseText}
                      style={{ maxWidth: '100%', borderRadius: '8px' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </Accordion.Body>
              </Accordion.Item>
            ))
          ) : (
            <Alert variant="info">Нет фраз</Alert>
          )}
        </Accordion>
      </Tab>

      <Tab 
        eventKey="quizzes" 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Тесты ({lesson.quizzes?.length || 0})</span>
            <Button 
              variant="link" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setShowQuizAddModal(true);
              }}
            >
              <FaPlusCircle size={18} />
            </Button>
          </div>
        }
      >
        <div className="quizzes-container">
          {lesson.quizzes?.length > 0 ? (
            lesson.quizzes.map(quiz => (
              <div key={quiz.id} className="quiz-item mb-3">
                <Card>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <Card.Title>
                          {quiz.type === 'NOUNS' ? 'Тест по существительным' : 'Грамматический тест'}
                        </Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                          Создан: {new Date(quiz.createdAt).toLocaleDateString()}
                        </Card.Subtitle>
                      </div>
                      <div>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={() => openQuizEditModal(quiz)}
                          className="me-2"
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="me-2"
                        >
                          <FaTrash />
                        </Button>
                        <Button 
                          variant={expandedQuiz === quiz.id ? 'secondary' : 'outline-secondary'}
                          size="sm"
                          onClick={() => toggleQuizQuestions(quiz.id)}
                        >
                          <FaQuestionCircle />
                        </Button>
                      </div>
                    </div>

                    {expandedQuiz === quiz.id && (
                      <div className="mt-3">
                        <QuizQuestions questions={getQuizQuestions(quiz.id)} />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            ))
          ) : (
            <Alert variant="info">Нет тестов</Alert>
          )}
        </div>
      </Tab>
    </Tabs>
  );
};

export default LessonTabs;