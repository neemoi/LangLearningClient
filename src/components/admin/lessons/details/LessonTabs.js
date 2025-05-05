import React from 'react';
import { Tabs, Tab, Card, Badge, Accordion, ListGroup, Alert, Button } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlusCircle } from 'react-icons/fa';

const LessonTabs = ({
  activeKey,
  setActiveKey,
  lesson,
  setShowWordAddModal,
  openWordEditModal,
  handleDeleteWord,
  setShowPhraseAddModal,
  openPhraseEditModal,
  handleDeletePhrase
}) => {
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
              className="add-word-btn"
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
              <Card key={word.id} className="word-card">
                {word.imageUrl && (
                  <div className="word-image">
                    <img
                      src={word.imageUrl}
                      alt={word.name}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
                <Card.Body>
                  <Card.Title>{word.name}</Card.Title>
                  <Card.Text>{word.translation}</Card.Text>
                  {word.isAdditional && <Badge bg="info">Доп.</Badge>}
                  <div className="word-actions">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => openWordEditModal(word)}
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
              className="add-phrase-btn"
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

      <Tab eventKey="quizzes" title={`Тесты (${lesson.quizzes?.length || 0})`}>
        <ListGroup>
          {lesson.quizzes?.length > 0 ? (
            lesson.quizzes.map(quiz => (
              <ListGroup.Item key={quiz.id}>
                <strong>{quiz.type}</strong> — {quiz.questionCount} вопросов
              </ListGroup.Item>
            ))
          ) : (
            <Alert variant="info">Нет тестов</Alert>
          )}
        </ListGroup>
      </Tab>
    </Tabs>
  );
};

export default LessonTabs;