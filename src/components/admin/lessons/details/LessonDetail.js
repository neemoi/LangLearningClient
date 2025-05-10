import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Spinner, Alert, Card, Badge } from 'react-bootstrap';
import YouTube from 'react-youtube';
import WordEditModal from '../words/WordEditModal';
import PhraseEditModal from '../phrases/PhrasesEditModal';
import WordAddModal from '../words/WordAddModal';
import PhraseAddModal from '../phrases/PhrasesAddModal';
import QuizAddModal from '../quiz/QuizAddModal';
import QuizEditModal from '../quiz/QuizEditModal';
import LessonTabs from '../details/LessonTabs';
import API_CONFIG from '../../../src/config';
import { FaFilePdf } from 'react-icons/fa';
import './LessonDetail.css';

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState('words');
  const [videoError, setVideoError] = useState(null);
  
  const [showWordAddModal, setShowWordAddModal] = useState(false);
  const [showWordEditModal, setShowWordEditModal] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [wordFormData, setWordFormData] = useState({
    name: '',
    translation: '',
    imageUrl: '',
    type: 'keyword'
  });
  const [wordErrors, setWordErrors] = useState({
    name: '',
    translation: '',
    imageUrl: ''
  });

  const [showPhraseAddModal, setShowPhraseAddModal] = useState(false);
  const [showPhraseEditModal, setShowPhraseEditModal] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [phraseFormData, setPhraseFormData] = useState({
    phraseText: '',
    translation: '',
    imageUrl: ''
  });
  const [phraseErrors, setPhraseErrors] = useState({
    phraseText: '',
    translation: '',
    imageUrl: ''
  });

  const [showQuizAddModal, setShowQuizAddModal] = useState(false);
  const [showQuizEditModal, setShowQuizEditModal] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        if (!id) throw new Error('ID урока не указан');
        setLoading(true);
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/Lessons/${id}`);
        if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
        const data = await res.json();
        setLesson(data);
      } catch (err) {
        setError(err?.message || 'Ошибка при загрузке урока');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateWordForm = () => {
    const newErrors = {
      name: !wordFormData.name ? 'Поле обязательно для заполнения' : '',
      translation: !wordFormData.translation ? 'Поле обязательно для заполнения' : '',
      imageUrl: wordFormData.imageUrl && !validateUrl(wordFormData.imageUrl) 
        ? 'Некорректный URL' : ''
    };
    
    setWordErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const validatePhraseForm = () => {
    const newErrors = {
      phraseText: !phraseFormData.phraseText ? 'Поле обязательно для заполнения' : '',
      translation: !phraseFormData.translation ? 'Поле обязательно для заполнения' : '',
      imageUrl: phraseFormData.imageUrl && !validateUrl(phraseFormData.imageUrl) 
        ? 'Некорректный URL' : ''
    };
    
    setPhraseErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/s]{11})/
    );
    return match?.[1] || null;
  };

  const renderMediaContent = () => {
    return (
      <div className="lesson-media-container">
        {lesson?.videoUrl && (
          <div className="lesson-video mb-4" style={{ height: '500px' }}>
            <h3>Видео урока</h3>
            {getYouTubeVideoId(lesson.videoUrl) ? (
              <YouTube
                videoId={getYouTubeVideoId(lesson.videoUrl)}
                opts={{
                  width: '100%',
                  height: '450px',
                  playerVars: {
                    autoplay: 0,
                  },
                }}
                onError={() => setVideoError('Не удалось загрузить видео')}
              />
            ) : (
              <video
                controls
                width="100%"
                height="450px"
                onError={() => setVideoError('Не удалось загрузить видео')}
              >
                <source src={lesson.videoUrl} type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
            )}
            {videoError && (
              <Alert variant="warning" className="mt-2">
                {videoError}
              </Alert>
            )}
          </div>
        )}

        {lesson?.pdfUrl && (
          <div className="lesson-pdf mb-4">
            <h3>
              <FaFilePdf className="me-2" /> Материалы урока
            </h3>
            <Button
              variant="btn btn-outline-secondary"
              href={lesson.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pdf-button"
            >
              Открыть PDF документ
            </Button>
          </div>
        )}
      </div>
    );
  };

  const handleAddWord = async () => {
    if (!validateWordForm()) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...wordFormData,
          lessonId: parseInt(id)
        }),
      });

      if (!response.ok) throw new Error('Ошибка при добавлении слова');

      const newWord = await response.json();
      setLesson(prev => ({
        ...prev,
        words: [...(prev.words || []), newWord]
      }));
      setShowWordAddModal(false);
      setWordFormData({
        name: '',
        translation: '',
        imageUrl: '',
        type: 'keyword'
      });
      setWordErrors({
        name: '',
        translation: '',
        imageUrl: ''
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditWord = async () => {
    if (!validateWordForm() || !currentWord?.id) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/words/${currentWord.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: wordFormData.name,
          translation: wordFormData.translation,
          imageUrl: wordFormData.imageUrl,
          type: 'keyword'
        }),
      });

      if (!response.ok) throw new Error('Ошибка при редактировании слова');

      setLesson(prev => ({
        ...prev,
        words: (prev.words || []).map(word => 
          word.id === currentWord.id ? { 
            ...word, 
            name: wordFormData.name,
            translation: wordFormData.translation,
            imageUrl: wordFormData.imageUrl,
            type: 'keyword'
          } : word
        )
      }));
      setShowWordEditModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteWord = async (wordId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это слово?')) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/words/${wordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Ошибка при удалении слова');

      setLesson(prev => ({
        ...prev,
        words: (prev.words || []).filter(word => word.id !== wordId)
      }));
    } catch (error) {
      alert(error.message);
    }
  };

  const openWordEditModal = (word) => {
    if (!word) return;
    
    setCurrentWord(word);
    setWordFormData({
      name: word.name || '',
      translation: word.translation || '',
      imageUrl: word.imageUrl || '',
      type: word.type || 'keyword'
    });
    setWordErrors({
      name: '',
      translation: '',
      imageUrl: ''
    });
    setShowWordEditModal(true);
  };

  const handleAddPhrase = async () => {
    if (!validatePhraseForm()) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/LessonPhrase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...phraseFormData,
          lessonId: parseInt(id)
        }),
      });

      if (!response.ok) throw new Error('Ошибка при добавлении фразы');

      const newPhrase = await response.json();
      setLesson(prev => ({
        ...prev,
        phrases: [...(prev.phrases || []), newPhrase]
      }));
      setShowPhraseAddModal(false);
      setPhraseFormData({
        phraseText: '',
        translation: '',
        imageUrl: ''
      });
      setPhraseErrors({
        phraseText: '',
        translation: '',
        imageUrl: ''
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditPhrase = async () => {
    if (!validatePhraseForm() || !currentPhrase?.id) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/LessonPhrase`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...phraseFormData,
          lessonId: parseInt(id),
          phraseId: currentPhrase.id
        }),
      });

      if (!response.ok) throw new Error('Ошибка при редактировании фразы');

      setLesson(prev => ({
        ...prev,
        phrases: (prev.phrases || []).map(phrase => 
          phrase.id === currentPhrase.id ? { 
            ...phrase, 
            phraseText: phraseFormData.phraseText,
            translation: phraseFormData.translation,
            imageUrl: phraseFormData.imageUrl
          } : phrase
        )
      }));
      setShowPhraseEditModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeletePhrase = async (phraseId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту фразу?')) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/LessonPhrase/${phraseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Ошибка при удалении фразы');

      setLesson(prev => ({
        ...prev,
        phrases: (prev.phrases || []).filter(phrase => phrase.id !== phraseId)
      }));
    } catch (error) {
      alert(error.message);
    }
  };

  const openPhraseEditModal = (phrase) => {
    if (!phrase) return;
    
    setCurrentPhrase(phrase);
    setPhraseFormData({
      phraseText: phrase.phraseText || '',
      translation: phrase.translation || '',
      imageUrl: phrase.imageUrl || ''
    });
    setPhraseErrors({
      phraseText: '',
      translation: '',
      imageUrl: ''
    });
    setShowPhraseEditModal(true);
  };

  const handleAddQuiz = (newQuiz) => {
    setLesson(prev => ({
      ...prev,
      quizzes: [...(prev.quizzes || []), newQuiz]
    }));
  };

  const handleEditQuiz = (updatedQuiz) => {
    setLesson(prev => ({
      ...prev,
      quizzes: (prev.quizzes || []).map(quiz => 
        quiz.id === updatedQuiz.id ? updatedQuiz : quiz
      )
    }));
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот тест?')) return;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/LessonQuiz/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Ошибка при удалении теста');

      setLesson(prev => ({
        ...prev,
        quizzes: (prev.quizzes || []).filter(quiz => quiz.id !== quizId)
      }));
    } catch (error) {
      alert(error.message);
    }
  };

  const openQuizEditModal = (quiz) => {
    setCurrentQuiz(quiz || null);
    setShowQuizEditModal(true);
  };

  const handleWordFormChange = (e) => {
    const { name, value } = e.target;
    setWordFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhraseFormChange = (e) => {
    const { name, value } = e.target;
    setPhraseFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="lesson-loading">
        <Spinner animation="border" />
        <p>Загрузка урока...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-error">
        <Alert variant="danger">{error}</Alert>
        <Button variant="dark" onClick={() => navigate(-1)}>Назад</Button>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-error">
        <Alert variant="warning">Урок не найден</Alert>
        <Button variant="dark" onClick={() => navigate(-1)}>Назад</Button>
      </div>
    );
  }

  return (
    <div className="lesson-page">
      <div className="back-btn-container">
        <Button variant="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          ← Назад
        </Button>
      </div>

      <header className="lesson-header">
        <div>
          <h1>{lesson.title || 'Без названия'}</h1>
          <div className="lesson-meta">
            <Badge bg="secondary">
              {lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString() : 'Дата не указана'}
            </Badge>
            <Badge bg={lesson.progressPercentage === 100 ? 'success' : 'warning'}>
              {lesson.progressPercentage || 0}% изучено
            </Badge>
          </div>
        </div>
      </header>

      {renderMediaContent()}

      <Card className="lesson-description">
        <Card.Body>
          <Card.Text>{lesson.description || 'Описание отсутствует'}</Card.Text>
        </Card.Body>
      </Card>

      <LessonTabs
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        lesson={lesson}
        setShowWordAddModal={setShowWordAddModal}
        openWordEditModal={openWordEditModal}
        handleDeleteWord={handleDeleteWord}
        setShowPhraseAddModal={setShowPhraseAddModal}
        openPhraseEditModal={openPhraseEditModal}
        handleDeletePhrase={handleDeletePhrase}
        setShowQuizAddModal={setShowQuizAddModal}
        openQuizEditModal={openQuizEditModal}
        handleDeleteQuiz={handleDeleteQuiz}
      />

      {showWordAddModal && (
        <WordAddModal
          show={showWordAddModal}
          onHide={() => setShowWordAddModal(false)}
          formData={wordFormData}
          errors={wordErrors}
          handleFormChange={handleWordFormChange}
          handleAddWord={handleAddWord}
        />
      )}

      {showPhraseAddModal && (
        <PhraseAddModal
          show={showPhraseAddModal}
          onHide={() => setShowPhraseAddModal(false)}
          formData={phraseFormData}
          errors={phraseErrors}
          handleFormChange={handlePhraseFormChange}
          handleAddPhrase={handleAddPhrase}
        />
      )}

      {showQuizAddModal && (
        <QuizAddModal
          show={showQuizAddModal}
          onHide={() => setShowQuizAddModal(false)}
          lessonId={parseInt(id)}
          onAddQuiz={handleAddQuiz}
        />
      )}

      {showWordEditModal && currentWord && (
        <WordEditModal
          show={showWordEditModal}
          onHide={() => setShowWordEditModal(false)}
          formData={wordFormData}
          errors={wordErrors}
          handleFormChange={handleWordFormChange}
          handleEditWord={handleEditWord}
        />
      )}

      {showPhraseEditModal && currentPhrase && (
        <PhraseEditModal
          show={showPhraseEditModal}
          onHide={() => setShowPhraseEditModal(false)}
          formData={phraseFormData}
          errors={phraseErrors}
          handleFormChange={handlePhraseFormChange}
          handleEditPhrase={handleEditPhrase}
        />
      )}

      {showQuizEditModal && currentQuiz && (
        <QuizEditModal
          show={showQuizEditModal}
          onHide={() => setShowQuizEditModal(false)}
          quiz={currentQuiz}
          lessonId={parseInt(id)}
          onEditQuiz={handleEditQuiz}
        />
      )}
    </div>
  );
};

export default LessonDetail;