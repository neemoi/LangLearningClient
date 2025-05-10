import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
  Tooltip,
  OverlayTrigger
} from 'react-bootstrap';
import {
  FaCheck,
  FaTimes,
  FaPlus,
  FaTrash,
  FaImage,
  FaHeadphones,
  FaSpellCheck,
  FaLanguage,
  FaMicrophone,
  FaPoll,
  FaInfoCircle
} from 'react-icons/fa';
import API_CONFIG from '../../../src/config';

const QUESTION_TYPE_MAPPING = {
  image_choice: 'ImageChoice',
  audio_choice: 'AudioChoice',
  image_audio_choice: 'ImageAudioChoice',
  spelling: 'Spelling',
  grammar_selection: 'GrammarSelection',
  pronunciation: 'Pronunciation',
  advanced_survey: 'AdvancedSurvey'
};

const QUESTION_TYPES = [
  {
    value: 'image_choice',
    label: 'Выбор по изображению',
    icon: <FaImage className="me-2" />,
    description: 'Ученик выбирает правильный ответ по изображению',
    requiresText: true,
    requiresImage: true,
    requiresAnswers: true,
    requiresCorrectAnswer: true
  },
  {
    value: 'audio_choice',
    label: 'Выбор по аудио',
    icon: <FaHeadphones className="me-2" />,
    description: 'Ученик выбирает ответ после прослушивания аудио',
    requiresText: true,
    requiresAudio: true,
    requiresAnswers: true,
    requiresCorrectAnswer: true
  },
  {
    value: 'image_audio_choice',
    label: 'Комбинированный выбор',
    icon: <><FaImage className="me-2" /><FaHeadphones /></>,
    description: 'Комбинация изображения и аудио',
    requiresText: true,
    requiresImage: true,
    requiresAudio: true,
    requiresAnswers: true,
    requiresCorrectAnswer: true
  },
  {
    value: 'spelling',
    label: 'Правописание',
    icon: <FaSpellCheck className="me-2" />,
    description: 'Проверка правильного написания',
    requiresText: true,
    requiresCorrectAnswer: true
  },
  {
    value: 'grammar_selection',
    label: 'Грамматика',
    icon: <FaLanguage className="me-2" />,
    description: 'Проверка грамматических знаний',
    requiresText: true,
    requiresCorrectAnswer: true
  },
  {
    value: 'pronunciation',
    label: 'Произношение',
    icon: <FaMicrophone className="me-2" />,
    description: 'Проверка правильного произношения',
    requiresText: true,
    requiresCorrectAnswer: true
  },
  {
    value: 'advanced_survey',
    label: 'Опрос',
    icon: <FaPoll className="me-2" />,
    description: 'Расширенный опрос',
    requiresText: true,
    requiresCorrectAnswer: true
  }
];

const QuizQuestionModal = ({ 
  show, 
  onHide, 
  quizId, 
  question = null, 
  onSaveSuccess
}) => {
  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'image_choice',
    imageUrl: '',
    audioUrl: '',
    correctAnswer: '',
    answers: [
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false }
    ]
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestionType = QUESTION_TYPES.find(
    type => type.value === formData.questionType
  ) || QUESTION_TYPES[0];

  useEffect(() => {
    if (show) {
      setApiError('');
      setErrors({});
      if (question) {
        const frontendQuestionType = Object.entries(QUESTION_TYPE_MAPPING)
          .find(([_, backendValue]) => backendValue === question.questionType)?.[0] || 'image_choice';

        setFormData({
          questionText: question.questionText || '',
          questionType: frontendQuestionType,
          imageUrl: question.imageUrl || '',
          audioUrl: question.audioUrl || '',
          correctAnswer: question.correctAnswer || '',
          answers: question.answers?.map(a => ({
            answerText: a.answerText || '',
            isCorrect: a.isCorrect || false
          })) || [
            { answerText: '', isCorrect: false },
            { answerText: '', isCorrect: false }
          ]
        });
      } else {
        resetForm();
      }
    }
  }, [question, show]);

  const resetForm = () => {
    setFormData({
      questionText: '',
      questionType: 'image_choice',
      imageUrl: '',
      audioUrl: '',
      correctAnswer: '',
      answers: [
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false }
      ]
    });
    setErrors({});
    setApiError('');
    setIsSaving(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (currentQuestionType.requiresText && !formData.questionText.trim()) {
      newErrors.questionText = 'Текст вопроса обязателен';
    }

    if (currentQuestionType.requiresCorrectAnswer) {
      if (!formData.correctAnswer.trim() && !formData.answers.some(a => a.isCorrect)) {
        newErrors.correctAnswer = 'Укажите правильный ответ или отметьте верный вариант';
      }
    }

    if (currentQuestionType.requiresImage && !formData.imageUrl.trim()) {
      newErrors.imageUrl = 'URL изображения обязателен';
    }

    if (currentQuestionType.requiresAudio && !formData.audioUrl.trim()) {
      newErrors.audioUrl = 'URL аудио обязателен';
    }

    if (currentQuestionType.requiresAnswers) {
      if (formData.answers.length < 1) {
        newErrors.answers = 'Необходим хотя бы один вариант ответа';
      } else if (formData.answers.some(a => !a.answerText.trim())) {
        newErrors.answers = 'Все варианты ответов должны быть заполнены';
      } else if (!formData.answers.some(a => a.isCorrect) && !formData.correctAnswer.trim()) {
        newErrors.answers = 'Необходимо указать хотя бы один правильный вариант ответа';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const preparePayload = () => {
    const payload = {
      quizId: Number(quizId),
      questionType: QUESTION_TYPE_MAPPING[formData.questionType] || 'ImageChoice',
      questionText: formData.questionText.trim(),
      correctAnswer: formData.correctAnswer.trim() || 
        (formData.answers.find(a => a.isCorrect)?.answerText || '')
    };
    if (formData.imageUrl) payload.imageUrl = formData.imageUrl.trim();
    if (formData.audioUrl) payload.audioUrl = formData.audioUrl.trim();
    if (formData.answers) {
      payload.answers = formData.answers.map(a => ({
        answerText: a.answerText.trim(),
        isCorrect: a.isCorrect
      }));
    }
    if (question) payload.id = question.id;
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setIsSaving(true);
      setApiError('');
      
      const payload = preparePayload();
      const method = question ? 'PUT' : 'POST';
      const url = question 
        ? `${API_CONFIG.BASE_URL}/api/QuizQuestion`
        : `${API_CONFIG.BASE_URL}/api/QuizQuestion`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.title || errorData.message || 'Ошибка сервера');
      }

      const savedQuestion = await response.json();
      onSaveSuccess(savedQuestion);
      onHide();
    } catch (error) {
      console.error('API Error:', error);
      setApiError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...formData.answers];
    const newValue = field === 'isCorrect' ? (typeof value === 'string' ? value === 'true' : value) : value;
    
    if (field === 'isCorrect' && newValue === true) {
      newAnswers.forEach(a => a.isCorrect = false);
    }
    
    newAnswers[index][field] = newValue;
    setFormData(prev => ({ ...prev, answers: newAnswers }));
    setErrors(prev => ({ ...prev, answers: undefined, correctAnswer: undefined }));
  };

  const addAnswer = () => {
    setFormData(prev => ({
      ...prev,
      answers: [...prev.answers, { answerText: '', isCorrect: false }]
    }));
  };

  const removeAnswer = (index) => {
    if (formData.answers.length <= 1) return;
    const newAnswers = formData.answers.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, answers: newAnswers }));
  };

  const renderTypeTooltip = (props) => (
    <Tooltip {...props}>{currentQuestionType.description}</Tooltip>
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{question ? 'Редактировать вопрос' : 'Создать новый вопрос'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {apiError && <Alert variant="danger">{apiError}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              Тип вопроса
              <OverlayTrigger placement="right" overlay={renderTypeTooltip}>
                <Button variant="link" size="sm" className="p-0 ms-2">
                  <FaInfoCircle />
                </Button>
              </OverlayTrigger>
            </Form.Label>
            <Form.Select
              name="questionType"
              value={formData.questionType}
              onChange={handleInputChange}
              isInvalid={!!errors.questionType}
            >
              {QUESTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {currentQuestionType.requiresText && (
            <Form.Group className="mb-3">
              <Form.Label>Текст вопроса *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="questionText"
                value={formData.questionText}
                onChange={handleInputChange}
                isInvalid={!!errors.questionText}
              />
              <Form.Control.Feedback type="invalid">
                {errors.questionText}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          {currentQuestionType.requiresCorrectAnswer && (
            <Form.Group className="mb-3">
              <Form.Label>Правильный ответ *</Form.Label>
              <Form.Control
                type="text"
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleInputChange}
                isInvalid={!!errors.correctAnswer}
                placeholder="Введите правильный ответ"
              />
              <Form.Control.Feedback type="invalid">
                {errors.correctAnswer}
              </Form.Control.Feedback>
              {formData.answers.some(a => a.isCorrect) && (
                <Form.Text className="text-muted">
                  Примечание: Есть вариант ответа, отмеченный как верный. Если вы укажете текст здесь, он будет иметь приоритет.
                </Form.Text>
              )}
            </Form.Group>
          )}

          {currentQuestionType.requiresImage && (
            <Form.Group className="mb-3">
              <Form.Label>Ссылка на изображение *</Form.Label>
              <Form.Control
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                isInvalid={!!errors.imageUrl}
              />
              <Form.Control.Feedback type="invalid">
                {errors.imageUrl}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          {currentQuestionType.requiresAudio && (
            <Form.Group className="mb-3">
              <Form.Label>Ссылка на аудио *</Form.Label>
              <Form.Control
                type="url"
                name="audioUrl"
                value={formData.audioUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/audio.mp3"
                isInvalid={!!errors.audioUrl}
              />
              <Form.Control.Feedback type="invalid">
                {errors.audioUrl}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          {currentQuestionType.requiresAnswers && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Варианты ответов *</h5>
                <Button variant="outline-primary" size="sm" onClick={addAnswer}>
                  <FaPlus /> Добавить вариант
                </Button>
              </div>

              {errors.answers && (
                <Alert variant="danger" className="mb-3">
                  {errors.answers}
                </Alert>
              )}

              {formData.answers.map((answer, index) => (
                <div key={index} className="mb-3 p-3 border rounded">
                  <Row className="align-items-center">
                    <Col md={8}>
                      <Form.Control
                        type="text"
                        value={answer.answerText}
                        onChange={(e) => handleAnswerChange(index, 'answerText', e.target.value)}
                        placeholder="Текст ответа"
                        isInvalid={errors.answers && !answer.answerText.trim()}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Select
                        value={answer.isCorrect.toString()}
                        onChange={(e) => handleAnswerChange(index, 'isCorrect', e.target.value)}
                      >
                        <option value="false">Неверный</option>
                        <option value="true">Верный</option>
                      </Form.Select>
                    </Col>
                    <Col md={1}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeAnswer(index)}
                        disabled={formData.answers.length <= 1}
                      >
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
            </>
          )}

          <Modal.Footer>
            <Button variant="secondary" onClick={onHide} disabled={isSaving}>
              <FaTimes /> Отмена
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  {question ? 'Сохранение...' : 'Создание...'}
                </>
              ) : (
                <>
                  <FaCheck className="me-2" />
                  {question ? 'Сохранить' : 'Создать'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default QuizQuestionModal;