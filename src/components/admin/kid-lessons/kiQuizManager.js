import React, { useState, useEffect } from 'react';
import { 
  Button, Card, Alert, Spinner, Badge, Accordion, 
  Modal, Form, InputGroup, FormControl, Tooltip, 
  OverlayTrigger, Row, Col, Table, ListGroup, Tab, Tabs 
} from 'react-bootstrap';
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, FaImage, 
  FaHeadphones, FaSpellCheck, FaInfoCircle, 
  FaCheck, FaTimes, FaListAlt, FaLink, FaQuestionCircle
} from 'react-icons/fa';

const QUIZ_TYPES = [
  {
    id: 1,
    value: 'image_choice',
    label: 'Выбор по изображению',
    icon: <FaImage className="me-2" />,
    description: 'Ученик выбирает правильный ответ по изображению',
    requiresText: false,
    requiresImage: true,
    requiresAudio: false,
    requiresAnswers: false,
    requiresCorrectAnswer: true
  },
  {
    id: 2,
    value: 'audio_choice',
    label: 'Выбор по аудио',
    icon: <FaHeadphones className="me-2" />,
    description: 'Ученик выбирает ответ после прослушивания аудио',
    requiresText: false,
    requiresImage: false,
    requiresAudio: true,
    requiresAnswers: false,
    requiresCorrectAnswer: true
  },
  {
    id: 3,
    value: 'image_audio_choice',
    label: 'Комбинированный выбор',
    icon: <><FaImage className="me-2" /><FaHeadphones /></>,
    description: 'Комбинация изображения и аудио',
    requiresText: false,
    requiresImage: true,
    requiresAudio: true,
    requiresAnswers: false,
    requiresCorrectAnswer: true
  },
  {
    id: 4,
    value: 'spelling',
    label: 'Правописание',
    icon: <FaSpellCheck className="me-2" />,
    description: 'Проверка правильного написания',
    requiresText: false,
    requiresImage: true,
    requiresAudio: false,
    requiresAnswers: false,
    requiresCorrectAnswer: true
  }
];

const KidQuizManager = ({ lessonId, token }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [formData, setFormData] = useState({
    lessonId: typeof lessonId === 'string' ? parseInt(lessonId) : lessonId,
    quizTypeId: 1,
    questionText: '',
    imageUrl: '',
    audioUrl: '',
    correctAnswer: '',
    answers: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState('info');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [failedMediaUrls, setFailedMediaUrls] = useState(new Set());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [lessonId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`https://localhost:7119/api/KidQuizQuestions/byLesson/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить тесты');
      }
      
      const data = await response.json();
      setQuizzes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentQuizType = () => {
    return QUIZ_TYPES.find(type => type.id === formData.quizTypeId) || QUIZ_TYPES[0];
  };

  const validateForm = () => {
    const currentType = getCurrentQuizType();
    const errors = {};
    
    if (currentType.requiresImage && !formData.imageUrl.trim()) {
      errors.imageUrl = 'URL изображения обязателен';
    }
    
    if (currentType.requiresAudio && !formData.audioUrl.trim()) {
      errors.audioUrl = 'URL аудио обязателен';
    }
    
    if (currentType.requiresCorrectAnswer && !formData.correctAnswer.trim()) {
      errors.correctAnswer = 'Правильный ответ обязателен';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const isEditing = !!currentQuiz;
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        ...(isEditing && { id: currentQuiz.id })
      };
      
      const response = await fetch('https://localhost:7119/api/KidQuizQuestions', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(isEditing ? 'Ошибка обновления' : 'Ошибка создания');
      }
      
      await fetchQuizzes();
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот тест?')) return;
    
    try {
      const response = await fetch(`https://localhost:7119/api/KidQuizQuestions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Ошибка удаления');
      }
      
      await fetchQuizzes();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (quiz = null) => {
    setCurrentQuiz(quiz);
    
    if (quiz) {
      setFormData({
        lessonId: quiz.lessonId,
        quizTypeId: quiz.quizTypeId,
        questionText: quiz.questionText || '',
        audioUrl: quiz.audioUrl || '',
        imageUrl: quiz.imageUrl || '',
        correctAnswer: quiz.correctAnswer || '',
        answers: []
      });
    } else {
      setFormData({
        lessonId: typeof lessonId === 'string' ? parseInt(lessonId) : lessonId,
        quizTypeId: 1,
        questionText: '',
        audioUrl: '',
        imageUrl: '',
        correctAnswer: '',
        answers: []
      });
    }
    
    setFormErrors({});
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.questionText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.correctAnswer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getQuizTypeBadge = (typeId) => {
    const type = QUIZ_TYPES.find(t => t.id === typeId) || QUIZ_TYPES[0];
    return (
      <Badge bg="info" className="d-flex align-items-center">
        {type.icon}
        <span className="ms-1">{type.label}</span>
      </Badge>
    );
  };

  const renderTypeTooltip = (props) => (
    <Tooltip {...props}>{getCurrentQuizType().description}</Tooltip>
  );

  const handleMediaError = (url) => {
    if (!failedMediaUrls.has(url)) {
      setFailedMediaUrls(prev => new Set(prev).add(url));
    }
  };

  const renderQuizDetails = (quiz) => {
    const quizType = QUIZ_TYPES.find(t => t.id === quiz.quizTypeId) || QUIZ_TYPES[0];
    
    return (
      <div className="quiz-details">
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="quiz-tabs" className="mb-3">
          <Tab eventKey="info" title={<><FaInfoCircle className="me-1" /> Информация</>}>
            <Row className="mt-3">
              <Col md={6} className="mb-3">
                <Card>
                  <Card.Header className="d-flex align-items-center">
                    <FaListAlt className="me-2" /> Основные данные
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span><strong>ID теста:</strong></span>
                        <Badge bg="dark">#{quiz.id}</Badge>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span><strong>Тип теста:</strong></span>
                        <Badge bg="info">
                          {quizType.icon}
                          <span className="ms-1">{quizType.label}</span>
                        </Badge>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span><strong>Урок:</strong></span>
                        <Badge bg="primary">#{quiz.lessonId}</Badge>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6} className="mb-3">
                <Card>
                  <Card.Header className="d-flex align-items-center">
                    <FaQuestionCircle className="me-2" /> Вопрос
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <h5>{quiz.questionText}</h5>
                    </div>
                    <div className="mb-3">
                      <h6 className="d-flex align-items-center">
                        <FaCheck className="me-2 text-success" />
                        <strong>Правильный ответ:</strong>
                      </h6>
                      <Badge bg="success" className="fs-6 p-2">
                        {quiz.correctAnswer}
                      </Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Row>
              <Col md={6} className="mb-3">
                <Card>
                  <Card.Header className="d-flex align-items-center">
                    <FaImage className="me-2" /> Медиа контент
                  </Card.Header>
                  <Card.Body>
                    {quiz.imageUrl && !failedMediaUrls.has(quiz.imageUrl) ? (
                      <>
                        <div className="text-center mb-3">
                          <img 
                            src={quiz.imageUrl} 
                            alt={quiz.questionText} 
                            className="img-fluid rounded quiz-image" 
                            onError={() => handleMediaError(quiz.imageUrl)} 
                          />
                        </div>
                        <div className="d-flex align-items-center small text-muted">
                          <FaLink className="me-1" />
                          <a href={quiz.imageUrl} target="_blank" rel="noopener noreferrer" className="text-truncate">
                            {quiz.imageUrl}
                          </a>
                        </div>
                      </>
                    ) : (
                      <Alert variant="secondary" className="text-center mb-0">
                        Изображение не прикреплено или недоступно
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {quiz.audioUrl && !failedMediaUrls.has(quiz.audioUrl) && (
              <Row>
                <Col md={6} className="mb-3">
                  <Card>
                    <Card.Header className="d-flex align-items-center">
                      <FaHeadphones className="me-2" /> Аудио
                    </Card.Header>
                    <Card.Body>
                      <audio 
                        controls 
                        src={quiz.audioUrl} 
                        className="w-100 mb-2" 
                        onError={() => handleMediaError(quiz.audioUrl)} 
                      />
                      <div className="d-flex align-items-center small text-muted">
                        <FaLink className="me-1" />
                        <a href={quiz.audioUrl} target="_blank" rel="noopener noreferrer" className="text-truncate">
                          {quiz.audioUrl}
                        </a>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </Tab>
        </Tabs>
        
        <div className="d-flex justify-content-end mt-3">
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="me-2" 
            onClick={() => openEditModal(quiz)}
          >
            <FaEdit className="me-1" /> Редактировать
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={() => handleDelete(quiz.id)}
          >
            <FaTrash className="me-1" /> Удалить
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Загрузка тестов...</p>
      </div>
    );
  }

  return (
    <div className="quiz-manager p-2 p-md-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-2">
        <h2 className="mb-2 mb-md-0">Управление тестами</h2>
        <div className="w-100 w-md-auto">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <FormControl 
              placeholder="Поиск по тестам..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </InputGroup>
        </div>
      </div>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
          {error}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body className="p-0">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-bottom gap-2">
            <div>
              <strong>Всего тестов:</strong>
              <Badge bg="primary" pill>{quizzes.length}</Badge>
            </div>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => openEditModal()} 
              className="w-100 w-md-auto"
            >
              <FaPlus className="me-1" /> Добавить тест
            </Button>
          </div>
          
          {filteredQuizzes.length > 0 ? (
            <Accordion alwaysOpen>
              {filteredQuizzes.map(quiz => (
                <Accordion.Item key={quiz.id} eventKey={quiz.id.toString()}>
                  <Accordion.Header>
                    <div className="d-flex flex-column flex-md-row justify-content-between w-100 align-items-md-center gap-1 gap-md-3">
                      <div className="d-flex align-items-center text-start">
                        <span className="fw-bold me-2 me-md-3 text-truncate">{quiz.questionText}</span>
                        {!isMobile && getQuizTypeBadge(quiz.quizTypeId)}
                      </div>
                      <div className="d-flex align-items-center justify-content-between w-100 w-md-auto">
                        {isMobile && getQuizTypeBadge(quiz.quizTypeId)}
                        <Badge bg="light" text="dark" className="ms-2">
                          ID: {quiz.id}
                        </Badge>
                      </div>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    {renderQuizDetails(quiz)}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          ) : (
            <Alert variant="info" className="text-center m-3">
              {searchTerm ? 'Тесты не найдены' : 'Нет тестов в этом уроке'}
            </Alert>
          )}
        </Card.Body>
      </Card>
      
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentQuiz ? (
              <>
                Редактирование теста 
                <small className="text-muted ms-2">ID: {currentQuiz.id}</small>
              </>
            ) : 'Добавление нового теста'}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Тип теста
                <OverlayTrigger placement="right" overlay={renderTypeTooltip}>
                  <Button variant="link" size="sm" className="p-0 ms-2">
                    <FaInfoCircle />
                  </Button>
                </OverlayTrigger>
              </Form.Label>
              <Form.Select
                name="quizTypeId"
                value={formData.quizTypeId}
                onChange={(e) => {
                  const newTypeId = parseInt(e.target.value);
                  const newType = QUIZ_TYPES.find(t => t.id === newTypeId) || QUIZ_TYPES[0];
                  
                  setFormData(prev => ({
                    ...prev,
                    quizTypeId: newTypeId,
                    imageUrl: newType.requiresImage ? prev.imageUrl : '',
                    audioUrl: newType.requiresAudio ? prev.audioUrl : '',
                    correctAnswer: newType.requiresCorrectAnswer ? prev.correctAnswer : ''
                  }));
                }}
              >
                {QUIZ_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {getCurrentQuizType().requiresImage && (
              <Form.Group className="mb-3">
                <Form.Label>Ссылка на изображение *</Form.Label>
                <Form.Control
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  isInvalid={!!formErrors.imageUrl}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.imageUrl}
                </Form.Control.Feedback>
              </Form.Group>
            )}

            {getCurrentQuizType().requiresAudio && (
              <Form.Group className="mb-3">
                <Form.Label>Ссылка на аудио *</Form.Label>
                <Form.Control
                  type="url"
                  name="audioUrl"
                  value={formData.audioUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/audio.mp3"
                  isInvalid={!!formErrors.audioUrl}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.audioUrl}
                </Form.Control.Feedback>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Правильный ответ *</Form.Label>
              <Form.Control
                type="text"
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleInputChange}
                isInvalid={!!formErrors.correctAnswer}
                placeholder={
                  getCurrentQuizType().value === 'spelling' 
                    ? 'Введите правильное написание слова' 
                    : 'Введите правильный ответ'
                }
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.correctAnswer}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <FaTimes className="me-1" /> Отмена
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <FaCheck className="me-1" />
            {currentQuiz ? 'Сохранить изменения' : 'Создать тест'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default KidQuizManager;