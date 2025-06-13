import React, { useState, useEffect } from 'react';
import {
  Button,
  Badge,
  Spinner,
  Alert,
  InputGroup,
  FormControl,
  ListGroup,
  Stack,
  Accordion,
  Card
} from 'react-bootstrap';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaInfoCircle,
  FaChevronDown,
  FaImage,
  FaHeadphones,
  FaSpellCheck,
  FaLanguage,
  FaMicrophone,
  FaPoll
} from 'react-icons/fa';
import API_CONFIG from '../../../src/config';
import QuizQuestionModal from '../quiz/QuizQuestionModal';

const QUESTION_TYPES_RU = {
  ImageChoice: {
    name: 'Выбор по изображению',
    icon: <FaImage className="me-1" />,
    color: 'primary',
    description: 'Участник выбирает правильный вариант, ориентируясь на изображение'
  },
  AudioChoice: {
    name: 'Выбор по аудио',
    icon: <FaHeadphones className="me-1" />,
    color: 'info',
    description: 'Участник выбирает ответ после прослушивания аудиозаписи'
  },
  ImageAudioChoice: {
    name: 'Комбинированный выбор',
    icon: (
      <>
        <FaImage className="me-1" />
        <FaHeadphones className="me-1" />
      </>
    ),
    color: 'warning',
    description: 'Сочетание изображения и звукового сопровождения'
  },
  Spelling: {
    name: 'Правописание',
    icon: <FaSpellCheck className="me-1" />,
    color: 'success',
    description: 'Проверка правильного написания слов и фраз'
  },
  GrammarSelection: {
    name: 'Грамматика',
    icon: <FaLanguage className="me-1" />,
    color: 'danger',
    description: 'Проверка знаний грамматических правил'
  },
  Pronunciation: {
    name: 'Произношение',
    icon: <FaMicrophone className="me-1" />,
    color: 'dark',
    description: 'Оценка правильности произношения'
  },
  AdvancedSurvey: {
    name: 'Расширенный опрос',
    icon: <FaPoll className="me-1" />,
    color: 'secondary',
    description: 'Развернутый вопрос с несколькими вариантами ответов'
  }
};

const QuizQuestions = ({ questions = [], quizId, onUpdate }) => {
  const [localQuestions, setLocalQuestions] = useState([...questions]);
  const [showModal, setShowModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setLocalQuestions([...questions]);
  }, [questions]);

  const getQuestionType = (type) => {
    return QUESTION_TYPES_RU[type] || { 
      name: type, 
      icon: <FaInfoCircle className="me-1" />,
      color: 'light',
      description: 'Неизвестный тип вопроса'
    };
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот вопрос?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/QuizQuestion/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Ошибка при удалении вопроса');

      setLocalQuestions(prev => prev.filter(q => q.id !== id));
      if (onUpdate) await onUpdate();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert(`Ошибка при удалении: ${error.message}`);
      setLocalQuestions([...questions]);
    } finally {
      setIsDeleting(false);
    }
  };

  const createQuestion = async (questionData) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/QuizQuestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 0,
          quizId: quizId,
          questionType: questionData.questionType,
          questionText: questionData.questionText,
          imageUrl: questionData.imageUrl || '',
          audioUrl: questionData.audioUrl || '',
          correctAnswer: questionData.correctAnswer || '',
          answers: questionData.answers.map(a => ({
            id: 0,
            answerText: a.answerText,
            isCorrect: a.isCorrect
          }))
        })
      });

      if (!response.ok) throw new Error('Ошибка при создании вопроса');

      const newQuestion = await response.json();
      setLocalQuestions(prev => [...prev, newQuestion]);
      if (onUpdate) await onUpdate();
      return newQuestion;
    } catch (error) {
      console.error('Ошибка создания:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const updateQuestion = async (questionData) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (!questionData.id) throw new Error('Отсутствует ID вопроса для обновления');

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/QuizQuestion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: questionData.id,
          quizId: quizId,
          questionType: questionData.questionType,
          questionText: questionData.questionText,
          imageUrl: questionData.imageUrl || '',
          audioUrl: questionData.audioUrl || '',
          correctAnswer: questionData.correctAnswer || '',
          answers: questionData.answers.map(a => ({
            id: a.id || 0,
            answerText: a.answerText,
            isCorrect: a.isCorrect
          }))
        })
      });

      if (!response.ok) throw new Error('Ошибка при обновлении вопроса');

      const updatedQuestion = await response.json();
      setLocalQuestions(prev => prev.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      ));
      if (onUpdate) await onUpdate();
      return updatedQuestion;
    } catch (error) {
      console.error('Ошибка обновления:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuestionSaved = async (questionData) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      let result;
      if (currentQuestion && currentQuestion.id) {
        result = await updateQuestion({
          ...questionData,
          id: currentQuestion.id
        });
      } else {
        result = await createQuestion(questionData);
      }
      
      setShowModal(false);
      setCurrentQuestion(null);
      return result;
    } catch (error) {
      alert(`Ошибка при сохранении: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredQuestions = localQuestions.filter(q => {
    const searchLower = searchTerm.toLowerCase();
    const typeInfo = getQuestionType(q.questionType);
    return (
      q.questionText.toLowerCase().includes(searchLower) ||
      typeInfo.name.toLowerCase().includes(searchLower) ||
      (q.correctAnswer && q.correctAnswer.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="quiz-manager p-3">
      <div className="header-section mb-4">
        <h4 className="mb-3 text-center text-md-start">Управление вопросами теста</h4>
        
        <div className="search-add-container d-flex flex-column flex-md-row gap-3 align-items-end">
          <InputGroup className="flex-grow-1">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Поиск по вопросам..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Button
            variant="primary"
            onClick={() => {
              setCurrentQuestion(null);
              setShowModal(true);
            }}
            className="w-100 w-md-auto"
            disabled={isProcessing}
          >
            <FaPlus className="me-2" /> Создать вопрос
          </Button>
        </div>
      </div>

      {filteredQuestions.length > 0 ? (
        <Accordion activeKey={activeKey} onSelect={setActiveKey} className="questions-accordion">
          {filteredQuestions.map((question) => {
            const typeInfo = getQuestionType(question.questionType);
            return (
              <Accordion.Item key={question.id} eventKey={question.id.toString()}>
                <Accordion.Header className="py-3">
                  <div className="d-flex w-100 align-items-center">
                    <Badge bg={typeInfo.color} className="me-3 py-2">
                      {typeInfo.icon} {typeInfo.name}
                    </Badge>
                    <span className="question-text-truncated flex-grow-1">
                      {question.questionText}
                    </span>
                    <FaChevronDown className="ms-2 accordion-arrow" />
                  </div>
                </Accordion.Header>
                <Accordion.Body className="pt-3 pb-4">
                  <div className="question-details">
                    <Card className="mb-4 border-0 shadow-sm">
                      <Card.Body>
                        <h6 className="fw-bold mb-3">Детали вопроса:</h6>
                        
                        <div className="mb-3">
                          <span className="text-muted small">Тип:</span>
                          <div className="d-flex align-items-center mt-1">
                            <Badge bg={typeInfo.color} className="me-2">
                              {typeInfo.icon}
                            </Badge>
                            <span>
                              {typeInfo.name} - {typeInfo.description}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <span className="text-muted small">Текст вопроса:</span>
                          <p className="mt-1 mb-0">{question.questionText}</p>
                        </div>

                        {question.imageUrl && (
                          <div className="mb-3">
                            <span className="text-muted small">Изображение:</span>
                            <p className="mt-1 mb-0">{question.imageUrl}</p>
                          </div>
                        )}

                        {question.audioUrl && (
                          <div className="mb-3">
                            <span className="text-muted small">Аудио:</span>
                            <p className="mt-1 mb-0">{question.audioUrl}</p>
                          </div>
                        )}

                        {question.correctAnswer && (
                          <div className="mb-3">
                            <span className="text-muted small">Правильный ответ:</span>
                            <p className="mt-1 mb-0 fw-semibold">
                              {question.correctAnswer}
                            </p>
                          </div>
                        )}
                      </Card.Body>
                    </Card>

                    {question.answers?.length > 0 && (
                      <Card className="mb-4 border-0 shadow-sm">
                        <Card.Body>
                          <h6 className="fw-bold mb-3">Варианты ответов:</h6>
                          <ListGroup variant="flush">
                            {question.answers.map((answer, idx) => (
                              <ListGroup.Item 
                                key={idx}
                                className={`answer-item ${answer.isCorrect ? 'correct-answer' : ''} py-2 px-3`}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <span>{answer.answerText}</span>
                                  {answer.isCorrect && (
                                    <Badge bg="success" pill className="px-2">
                                      Верный
                                    </Badge>
                                  )}
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </Card.Body>
                      </Card>
                    )}

                    <Stack direction="horizontal" gap={3} className="mt-4">
                      <Button
                        variant="outline-primary"
                        onClick={() => {
                          setCurrentQuestion(question);
                          setShowModal(true);
                        }}
                        className="flex-grow-1"
                        disabled={isProcessing}
                      >
                        <FaEdit className="me-2" /> Редактировать
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDelete(question.id)}
                        disabled={isDeleting || isProcessing}
                        className="flex-grow-1"
                      >
                        {isDeleting ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                            Удаление...
                          </>
                        ) : (
                          <>
                            <FaTrash className="me-2" /> Удалить
                          </>
                        )}
                      </Button>
                    </Stack>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      ) : (
        <Alert variant="info" className="text-center py-4">
          {searchTerm ? (
            <>
              <h5>Вопросы не найдены</h5>
              <p className="mb-0">Попробуйте изменить параметры поиска</p>
            </>
          ) : (
            <>
              <h5>В этом тесте пока нет вопросов</h5>
              <p className="mb-0">Создайте первый вопрос, нажав на кнопку выше</p>
            </>
          )}
        </Alert>
      )}

      <QuizQuestionModal
        show={showModal}
        onHide={() => {
          if (!isProcessing) {
            setShowModal(false);
            setCurrentQuestion(null);
          }
        }}
        quizId={quizId}
        question={currentQuestion}
        onSaveSuccess={handleQuestionSaved}
        isSaving={isProcessing}
      />
    </div>
  );
};

export default QuizQuestions;