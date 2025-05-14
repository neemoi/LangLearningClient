import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Table, Form, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaTrashAlt, FaEdit, FaEye } from 'react-icons/fa';
import API_CONFIG from '../../src/config';
import './WordsListModal.css';

const WordsListModal = ({ show, letter, onHide }) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState('');
  const [editWord, setEditWord] = useState(null);
  const [editForm, setEditForm] = useState({
    id: 0,
    name: '',
    imageUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: ''
  });

  const fetchWords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter/${letter.id}/words`);
      if (!response.ok) throw new Error('Ошибка загрузки слов');
      
      const data = await response.json();
      const wordsArray = Array.isArray(data) ? data : data ? [data] : [];
      setWords(wordsArray);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [letter.id]);

  useEffect(() => {
    if (show && letter) {
      fetchWords();
    }
  }, [show, letter, fetchWords]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Слово обязательно';
    }
    
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'URL изображения обязателен';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Некорректный URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter/${letter.id}/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Ошибка добавления слова');
      
      await fetchWords();
      setFormData({ name: '', imageUrl: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWord = async (wordId) => {
    const isConfirmed = window.confirm('Вы уверены, что хотите удалить это слово?');
    if (!isConfirmed) return;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter/${letter.id}/words/${wordId}`, {
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

  const handleEditWord = (word) => {
    setEditWord(word);
    setEditForm({
      id: word.id,
      name: word.name,
      imageUrl: word.imageUrl
    });
  };

  const handleCancelEdit = () => {
    setEditWord(null);
    setEditForm({
      id: 0,
      name: '',
      imageUrl: ''
    });
    setErrors({});
  };

  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editForm.name.trim()) {
      newErrors.name = 'Слово обязательно';
    }
    
    if (!editForm.imageUrl.trim()) {
      newErrors.imageUrl = 'URL изображения обязателен';
    } else if (!isValidUrl(editForm.imageUrl)) {
      newErrors.imageUrl = 'Некорректный URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateEditForm()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter/words`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          ...editForm,
          alphabetLetterId: letter.id
        })
      });

      if (!response.ok) throw new Error('Ошибка обновления слова');
      
      await fetchWords();
      handleCancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="words-modal">
      <Modal.Header closeButton>
        <Modal.Title>Слова для буквы "{letter?.symbol}"</Modal.Title>
      </Modal.Header>
      <Modal.Body className="words-modal-body">
        <div className="words-list-container">
          <h5>Список слов ({words.length})</h5>
          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : words.length > 0 ? (
            <div className="words-table-wrapper">
              <Table striped bordered hover className="words-table">
                <thead>
                  <tr>
                    <th>Слово</th>
                    <th>Изображение</th>
                    <th width="150">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {words.map(word => (
                    <tr key={word.id}>
                      <td>
                        {editWord?.id === word.id ? (
                          <Form.Control
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            isInvalid={!!errors.name}
                          />
                        ) : (
                          word.name
                        )}
                      </td>
                      <td>
                        {editWord?.id === word.id ? (
                          <Form.Control
                            type="url"
                            value={editForm.imageUrl}
                            onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})}
                            isInvalid={!!errors.imageUrl}
                          />
                        ) : word.imageUrl ? (
                          <a href={word.imageUrl} target="_blank" rel="noopener noreferrer" className="text-dark">
                            <FaEye className="me-1" /> Просмотреть
                          </a>
                        ) : 'Нет изображения'}
                      </td>
                      <td className="text-center">
                        {editWord?.id === word.id ? (
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={loading}
                            >
                              Сохранить
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={loading}
                            >
                              Отмена
                            </Button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-center gap-2">
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
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info">
              Нет слов для этой буквы
            </Alert>
          )}
        </div>

        <div className="add-word-form-container">
          <h5>Добавить новое слово</h5>
          <Form onSubmit={handleAddWord}>
            <Form.Group className="mb-3">
              <Form.Label>Слово *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                isInvalid={!!errors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL изображения *</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com/image.png"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                isInvalid={!!errors.imageUrl}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.imageUrl}
              </Form.Control.Feedback>
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loading}>
              <FaPlus className="me-2" /> {loading ? 'Добавление...' : 'Добавить слово'}
            </Button>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Закрыть
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WordsListModal;