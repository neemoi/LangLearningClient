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
  FaSearch,
  FaInfoCircle
} from 'react-icons/fa';
import QuizQuestions from './../quiz/QuizQuestions';
import './LessonTabs.css';

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

  const getQuizTypeName = (type) => {
    switch(type) {
      case 'NOUNS': return 'Существительные';
      case 'VERBS': return 'Глаголы';
      case 'GRAMMAR': return 'Грамматика';
      case 'VOCABULARY': return 'Лексика';
      default: return 'Общий тест';
    }
  };

  return (
    <Tabs
      activeKey={activeKey}
      onSelect={(k) => setActiveKey(k)}
      className="lesson-tabs mb-3"
      fill
    >
      <Tab eventKey="words" title={
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
      }>
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
              <Card key={word.id} className="mb-3 word-card">
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
                        className="word-image"
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

      <Tab eventKey="phrases" title={
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
      }>
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

        <Accordion className="phrases-accordion">
          {filteredPhrases.length > 0 ? (
            filteredPhrases.map((phrase, idx) => (
              <Accordion.Item eventKey={idx.toString()} key={phrase.id} className="phrase-item">
                <Accordion.Header className="phrase-header">
                  <div className="d-flex justify-content-between w-100">
                    <span className="phrase-text">{phrase.phraseText}</span>
                    <div className="phrase-actions">
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
                <Accordion.Body className="phrase-body">
                  <p><strong>Перевод:</strong> {phrase.translation}</p>
                  {phrase.imageUrl && (
                    <img
                      src={phrase.imageUrl}
                      alt={phrase.phraseText}
                      className="phrase-image"
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

      <Tab eventKey="quizzes" title={
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
      }>
        <div className="quizzes-container">
          {isRefreshing ? (
            <div className="text-center p-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : lesson.quizzes?.length > 0 ? (
            lesson.quizzes.map(quiz => (
              <div key={quiz.id} className="quiz-item mb-3">
                <Card className="quiz-card">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1 me-3">
                        <div className="d-flex align-items-center mb-2">
                          <h3 className="quiz-title mb-0">
                            {quiz.title || getQuizTypeName(quiz.type)}
                          </h3>
                          <Badge bg="info" className="ms-2">
                            {getQuizTypeName(quiz.type)}
                          </Badge>
                        </div>
                        
                        <div className="quiz-info">
                          <div className="d-flex flex-wrap gap-3 mb-2">
                            <div className="d-flex align-items-center">
                              <FaQuestionCircle className="text-muted me-2" />
                              <span>{quiz.questions?.length || 0} вопросов</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <FaInfoCircle className="text-muted me-2" />
                              <span>Создан: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {quiz.description && (
                            <div className="quiz-description">
                              <p className="mb-0">{quiz.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="quiz-actions d-flex flex-column">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="mb-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuizEditModal(quiz);
                          }}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="mb-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuiz(quiz.id);
                          }}
                        >
                          <FaTrash />
                        </Button>
                        <Button
                          variant={expandedQuiz === quiz.id ? 'primary' : 'outline-secondary'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleQuizQuestions(quiz.id);
                          }}
                        >
                          <FaQuestionCircle />
                        </Button>
                      </div>
                    </div>

                    {expandedQuiz === quiz.id && (
                      <div className="quiz-questions-wrapper mt-3">
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