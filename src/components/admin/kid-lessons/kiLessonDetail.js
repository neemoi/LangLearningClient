import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, Card, Alert, Spinner, Badge, Tabs, Tab, 
  InputGroup, FormControl, Container
} from 'react-bootstrap';
import { FaSearch, FaPlusCircle, FaEdit, FaTrash, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import API_CONFIG from '../../../components/src/config';
import KidWordCardModal from './kiWordCardModal';
import KidQuizManager from './kiQuizManager';
import './kidLessonDetail.css';

const KidLessonDetail = ({ lesson: initialLesson, refreshData }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(initialLesson);
  const [loading, setLoading] = useState(!initialLesson);
  const [error, setLocalError] = useState(null);
  const [cardsError, setCardsError] = useState(null);
  const [quizzesError, setQuizzesError] = useState(null);
  const [activeKey, setActiveKey] = useState('cards');
  const [showCardModal, setShowCardModal] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [cardFormData, setCardFormData] = useState({
    word: '',
    imageUrl: '',
    audioUrl: ''
  });
  const [cardErrors, setCardErrors] = useState({
    word: '',
    imageUrl: '',
    audioUrl: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    if (!initialLesson && id) {
      const fetchLesson = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/kid-lessons/${id}`);
          if (!response.ok) throw new Error('Не удалось загрузить урок');
          const data = await response.json();
          setLesson(data);
        } catch (err) {
          setLocalError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchLesson();
    }
  }, [id, initialLesson]);

  const fetchCards = async () => {
    try {
      setCardsError(null);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/KidWordCard/lesson/${id}`);
      if (!response.ok) throw new Error('Ошибка загрузки карточек');
      const data = await response.json();
      setLesson(prev => ({ ...prev, wordCards: data }));
    } catch (err) {
      setCardsError(err.message);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setQuizzesError(null);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/KidQuizQuestions/byLesson/${id}`);
      if (!response.ok) throw new Error('Ошибка загрузки тестов');
      const data = await response.json();
      setQuizzes(data);
      setLesson(prev => ({ ...prev, quizQuestions: data }));
    } catch (err) {
      setQuizzesError(err.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCards();
      fetchQuizzes();
    }
  }, [id]);

  const handleQuizUpdate = (updatedQuizzes) => {
    setQuizzes(updatedQuizzes);
    setLesson(prev => ({ ...prev, quizQuestions: updatedQuizzes }));
  };

  const filteredCards = lesson?.wordCards?.filter(card => 
    card.word.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const isValidUrl = (url) => {
    if (!url || url.trim() === '') return true;
    try {
      new URL(url);
      return /^https?:\/\//i.test(url);
    } catch {
      return false;
    }
  };

  const validateCardForm = () => {
    const errors = {
      word: !cardFormData.word.trim() ? 'Слово обязательно' : '',
      imageUrl: !cardFormData.imageUrl.trim() ? 'URL изображения обязателен' : 
               !isValidUrl(cardFormData.imageUrl) ? 'Некорректный URL изображения' : '',
      audioUrl: cardFormData.audioUrl.trim() && !isValidUrl(cardFormData.audioUrl) ? 
                'Некорректный URL аудио' : ''
    };
    
    setCardErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSaveCard = async () => {
    if (!validateCardForm()) return;

    try {
      const url = `${API_CONFIG.BASE_URL}/api/KidWordCard`;
      const method = currentCard ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          ...cardFormData,
          kidLessonId: parseInt(id),
          ...(currentCard && { id: currentCard.id })
        })
      });

      if (!response.ok) throw new Error('Ошибка сохранения');

      await fetchCards();
      setShowCardModal(false);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту карточку?')) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/KidWordCard/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) throw new Error('Ошибка удаления');

      await fetchCards();
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const openCardEditModal = (card = null) => {
    setCurrentCard(card);
    setCardFormData({
      word: card?.word || '',
      imageUrl: card?.imageUrl || '',
      audioUrl: card?.audioUrl || ''
    });
    setCardErrors({
      word: '',
      imageUrl: '',
      audioUrl: ''
    });
    setShowCardModal(true);
  };

  if (loading) {
    return (
      <div className="lesson-loading">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Загрузка урока...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-error">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-1" /> Вернуться назад
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-error">
        <Alert variant="warning" className="text-center">
          Урок не найден
        </Alert>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-1" /> Вернуться назад
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Container className="lesson-page py-4">
      <Button 
        variant="btn btn-outline-secondary" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <FaArrowLeft className="me-1" /> Назад к урокам
      </Button>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h1 className="lesson-title mb-3">{lesson.title || 'Без названия'}</h1>
          
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Badge bg="light" text="dark" className="px-3 py-2">
              <span className="fw-bold">Карточки:</span> {lesson.wordCards?.length || 0}
            </Badge>
            <Badge bg="light" text="dark" className="px-3 py-2">
              <span className="fw-bold">Тесты:</span> {quizzes.length}
            </Badge>
          </div>

          {lesson.imageUrl && (
            <div className="lesson-media-container mb-3">
              <img 
                src={lesson.imageUrl} 
                alt={lesson.title} 
                className="lesson-image img-fluid rounded"
              />
            </div>
          )}

          <Card className="description-card mb-3">
            <Card.Header className="d-flex align-items-center">
              <FaInfoCircle className="me-2 text-black" />     
              <span className="fw-bold">Описание урока</span>
            </Card.Header>
            <Card.Body>
              <Card.Text className="mb-0">
                {lesson.description || 'Описание отсутствует'}
              </Card.Text>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {cardsError && (
        <Alert variant="warning" dismissible onClose={() => setCardsError(null)} className="mb-4">
          {cardsError}
        </Alert>
      )}

      {quizzesError && (
        <Alert variant="warning" dismissible onClose={() => setQuizzesError(null)} className="mb-4">
          {quizzesError}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <Tabs activeKey={activeKey} onSelect={setActiveKey} className="mb-3" fill>
            <Tab eventKey="cards" title={`Карточки (${filteredCards.length})`}>
              <div className="mb-4">
                <InputGroup className="mb-3">
                  <InputGroup.Text className="bg-light">
                    <FaSearch />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Поиск по карточкам..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                  />
                </InputGroup>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Список карточек</h5>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => openCardEditModal()}
                    className="d-flex align-items-center"
                  >
                    <FaPlusCircle className="me-1" /> Добавить
                  </Button>
                </div>

                {filteredCards.length > 0 ? (
                  <div className="cards-grid">
                    {filteredCards.map(card => (
                      <Card key={card.id} className="h-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title className="mb-0">{card.word}</Card.Title>
                            <div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => openCardEditModal(card)}
                                title="Редактировать"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteCard(card.id)}
                                title="Удалить"
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </div>

                          {card.imageUrl && (
                            <div className="text-center my-2">
                              <img
                                src={card.imageUrl}
                                alt={card.word}
                                className="card-image img-fluid rounded"
                              />
                            </div>
                          )}

                          {card.audioUrl && card.audioUrl.trim() !== '' && (
                            <div className="mt-auto">
                              <audio controls src={card.audioUrl} className="w-100 mt-2" />
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info" className="text-center">
                    {searchTerm ? 'Ничего не найдено' : 'Нет карточек в этом уроке'}
                  </Alert>
                )}
              </div>
            </Tab>

            <Tab eventKey="quiz" title={`Тесты (${quizzes.length})`}>
              <KidQuizManager 
                lessonId={id} 
                quizzes={quizzes}
                onQuizUpdate={handleQuizUpdate}
              />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      <KidWordCardModal
        show={showCardModal}
        onHide={() => setShowCardModal(false)}
        formData={cardFormData}
        errors={cardErrors}
        handleFormChange={(e) => {
          const { name, value } = e.target;
          setCardFormData(prev => ({ ...prev, [name]: value }));
          setCardErrors(prev => ({ ...prev, [name]: '' }));
        }}
        handleSave={handleSaveCard}
        isEditing={!!currentCard}
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setLocalError(null)} className="mt-4">
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default KidLessonDetail;