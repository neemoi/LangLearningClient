import React, { useState } from 'react';
import {
  Tabs,
  Tab,
  Card,
  Accordion,
  Alert,
  Button,
  Spinner,
  Badge,
  InputGroup,
  FormControl
} from 'react-bootstrap';
import {
  FaEdit,
  FaTrash,
  FaPlusCircle,
  FaQuestionCircle,
  FaSearch
} from 'react-icons/fa';
import QuizQuestions from './../quiz/QuizQuestions';

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
  onRefreshData
}) => {
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wordsSearchTerm, setWordsSearchTerm] = useState('');
  const [phrasesSearchTerm, setPhrasesSearchTerm] = useState('');

  const toggleQuizQuestions = (quizId) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  const getQuizQuestions = (quizId) => {
    const quiz = lesson.quizzes?.find(q => q.id === quizId);
    return quiz?.questions || [];
  };

  const handleQuestionUpdate = async () => {
    if (onRefreshData) {
      setIsRefreshing(true);
      try {
        await onRefreshData();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const filteredWords = lesson.words?.filter(word => 
    word.name.toLowerCase().includes(wordsSearchTerm.toLowerCase()) ||
    word.translation.toLowerCase().includes(wordsSearchTerm.toLowerCase())
  ) || [];

  const filteredPhrases = lesson.phrases?.filter(phrase =>
    phrase.phraseText.toLowerCase().includes(phrasesSearchTerm.toLowerCase()) ||
    phrase.translation.toLowerCase().includes(phrasesSearchTerm.toLowerCase())
  ) || [];

  return (
    <Tabs
      activeKey={activeKey}
      onSelect={(k) => setActiveKey(k)}
      className="lesson-tabs mb-3"
      fill
    >
      <Tab
        eventKey="words"
        title={
          <div className="d-flex align-items-center">
            <span>Слова ({lesson.words?.length || 0})</span>
            <Button
              variant="link"
              size="sm"
              className="ms-2 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowWordAddModal(true);
              }}
            >
              <FaPlusCircle size={16} />
            </Button>
          </div>
        }
      >
        <div className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Поиск слов..."
              value={wordsSearchTerm}
              onChange={(e) => setWordsSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>

        <div className="words-grid">
          {filteredWords.length > 0 ? (
            filteredWords.map(word => (
              <Card key={word.id} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <Card.Title>{word.name}</Card.Title>
                      <Card.Text>{word.translation}</Card.Text>
                      {word.isAdditional && (
                        <Badge bg="warning" className="mb-2">Дополнительное</Badge>
                      )}
                    </div>
                    {word.imageUrl && (
                      <img
                        src={word.imageUrl}
                        alt={word.name}
                        style={{ width: 60, height: 60, objectFit: 'cover' }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>
                  <div className="d-flex justify-content-end mt-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
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
            <Alert variant="info">
              {wordsSearchTerm ? 'Слова не найдены' : 'Нет слов в этом уроке'}
            </Alert>
          )}
        </div>
      </Tab>

      <Tab
        eventKey="phrases"
        title={
          <div className="d-flex align-items-center">
            <span>Фразы ({lesson.phrases?.length || 0})</span>
            <Button
              variant="link"
              size="sm"
              className="ms-2 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowPhraseAddModal(true);
              }}
            >
              <FaPlusCircle size={16} />
            </Button>
          </div>
        }
      >
        <div className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Поиск фраз..."
              value={phrasesSearchTerm}
              onChange={(e) => setPhrasesSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>

        <Accordion>
          {filteredPhrases.length > 0 ? (
            filteredPhrases.map((phrase, idx) => (
              <Accordion.Item eventKey={idx.toString()} key={phrase.id}>
                <Accordion.Header>
                  <div className="d-flex justify-content-between w-100">
                    <span>{phrase.phraseText}</span>
                    <div className="d-flex">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
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
                      style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </Accordion.Body>
              </Accordion.Item>
            ))
          ) : (
            <Alert variant="info">
              {phrasesSearchTerm ? 'Фразы не найдены' : 'Нет фраз в этом уроке'}
            </Alert>
          )}
        </Accordion>
      </Tab>

      <Tab
        eventKey="quizzes"
        title={
          <div className="d-flex align-items-center">
            <span>Тесты ({lesson.quizzes?.length || 0})</span>
            <Button
              variant="link"
              size="sm"
              className="ms-2 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuizAddModal(true);
              }}
            >
              <FaPlusCircle size={16} />
            </Button>
          </div>
        }
      >
        <div className="quizzes-container">
          {isRefreshing ? (
            <div className="text-center p-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : lesson.quizzes?.length > 0 ? (
            lesson.quizzes.map(quiz => (
              <div key={quiz.id} className="quiz-item mb-3">
                <Card>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <Card.Title>
                          {quiz.title || (quiz.type === 'NOUNS' ? 'Тест по существительным' : 'Грамматический тест')}
                        </Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                          Создан: {new Date(quiz.createdAt).toLocaleDateString()}
                          {quiz.questions?.length > 0 && (
                            <span className="ms-2">
                              <Badge bg="info">
                                Вопросов: {quiz.questions.length}
                              </Badge>
                            </span>
                          )}
                        </Card.Subtitle>
                      </div>
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => openQuizEditModal(quiz)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="me-2"
                          onClick={() => handleDeleteQuiz(quiz.id)}
                        >
                          <FaTrash />
                        </Button>
                        <Button
                          variant={expandedQuiz === quiz.id ? 'primary' : 'outline-secondary'}
                          size="sm"
                          onClick={() => toggleQuizQuestions(quiz.id)}
                        >
                          <FaQuestionCircle />
                        </Button>
                      </div>
                    </div>

                    {expandedQuiz === quiz.id && (
                      <div className="mt-3">
                        <QuizQuestions
                          questions={getQuizQuestions(quiz.id)}
                          quizId={quiz.id}
                          onUpdate={handleQuestionUpdate}
                        />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            ))
          ) : (
            <Alert variant="info">Нет тестов в этом уроке</Alert>
          )}
        </div>
      </Tab>
    </Tabs>
  );
};

export default LessonTabs;