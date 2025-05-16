import React, { useState, useEffect } from 'react';
import { 
  Modal, Button, Table, Form, Alert, Spinner, 
  Badge, FloatingLabel, Stack
} from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import API_CONFIG from '../../src/config';

const WordsModal = ({ show, category, onHide }) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWordModal, setShowWordModal] = useState(false);
  const [currentWord, setCurrentWord] = useState({
    id: 0,
    name: '',
    imagePath: '',
    mainQuestionId: 0
  });
  const [isEditing, setIsEditing] = useState(false);

  const API_URL = `${API_CONFIG.BASE_URL}/api/MainQuestions`;

  useEffect(() => {
    if (show && category) {
      fetchWords();
      setCurrentWord(prev => ({ ...prev, mainQuestionId: category.id }));
    }
  }, [show, category]);

  const fetchWords = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/categories/${category.id}/words`);
      
      if (!response.ok) throw new Error('Ошибка загрузки слов');
      
      const data = await response.json();
      setWords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = () => {
    setCurrentWord({
      id: 0,
      name: '',
      imagePath: '',
      mainQuestionId: category.id
    });
    setIsEditing(false);
    setShowWordModal(true);
  };

  const handleEditWord = (word) => {
    setCurrentWord(word);
    setIsEditing(true);
    setShowWordModal(true);
  };

  const handleSaveWord = async () => {
    try {
      setError('');
      
      if (!currentWord.name.trim()) {
        throw new Error('Название слова обязательно');
      }

      let url, method;
      
      if (isEditing) {
        url = `${API_URL}/words`;
        method = 'PATCH';
      } else {
        url = `${API_URL}/categories/words`;
        method = 'POST';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(currentWord)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка ${isEditing ? 'обновления' : 'добавления'} слова`);
      }
      
      await fetchWords();
      setShowWordModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteWord = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это слово?')) return;
    
    try {
      const response = await fetch(`${API_URL}/words/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) throw new Error('Ошибка удаления слова');
      await fetchWords();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Слова для категории: {category?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <div className="d-flex justify-content-between mb-3">
            <Button 
              variant="primary" 
              onClick={handleAddWord}
              className="d-flex align-items-center"
            >
              <FaPlus className="me-2" /> Добавить слово
            </Button>
            <Badge bg="light" text="dark" className="px-3 py-2">
              Всего слов: {words.length}
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : words.length > 0 ? (
            <Table hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Слово</th>
                  <th>Изображение</th>
                  <th className="text-center">Действия</th>
                </tr>
              </thead>
              <tbody>
                {words.map(word => (
                  <tr key={word.id}>
                    <td>{word.id}</td>
                    <td className="fw-bold">{word.name}</td>
                    <td>
                      {word.imagePath && (
                        <a 
                          href={word.imagePath} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          <small className="text-primary">Просмотр</small>
                        </a>
                      )}
                    </td>
                    <td className="text-center">
                      <Stack direction="horizontal" gap={2} className="justify-content-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditWord(word)}
                          title="Редактировать"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteWord(word.id)}
                          title="Удалить"
                        >
                          <FaTrashAlt />
                        </Button>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5 text-muted">
              Нет слов для этой категории
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showWordModal} onHide={() => setShowWordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Редактирование слова' : 'Добавление слова'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <FloatingLabel label="Слово *">
              <Form.Control
                type="text"
                value={currentWord.name}
                onChange={(e) => setCurrentWord({...currentWord, name: e.target.value})}
                placeholder="Введите слово"
              />
            </FloatingLabel>
          </Form.Group>
          <Form.Group>
            <FloatingLabel label="URL изображения">
              <Form.Control
                type="text"
                value={currentWord.imagePath}
                onChange={(e) => setCurrentWord({...currentWord, imagePath: e.target.value})}
                placeholder="Введите URL изображения"
              />
            </FloatingLabel>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWordModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSaveWord}>
            {isEditing ? 'Сохранить' : 'Добавить'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default WordsModal;