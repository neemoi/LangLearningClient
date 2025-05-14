import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const AlphabetLetterEditModal = ({ show, letter, onHide, onSave, existingLetters }) => {
  const [formData, setFormData] = useState({
    id: 0,
    symbol: '',
    imageUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (letter) {
      setFormData({
        id: letter.id || 0,
        symbol: letter.symbol || '',
        imageUrl: letter.imageUrl || ''
      });
    } else {
      setFormData({
        id: 0,
        symbol: '',
        imageUrl: ''
      });
    }
    setErrors({});
    setFormError('');
  }, [letter]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Буква обязательна для заполнения';
    } else if (
      existingLetters.some(
        l => l.symbol.toLowerCase() === formData.symbol.toLowerCase() && 
             l.id !== formData.id
      )
    ) {
      newErrors.symbol = 'Такая буква уже существует';
    }
    
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'URL изображения обязателен';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Некорректный URL изображения';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSave(formData);
    } catch (err) {
      setFormError(err.message || 'Произошла ошибка при сохранении');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{letter ? 'Редактирование буквы' : 'Добавление буквы'}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          {formError && (
            <Alert variant="danger" dismissible onClose={() => setFormError('')}>
              {formError}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Буква *</Form.Label>
            <Form.Control
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({...formData, symbol: e.target.value})}
              isInvalid={!!errors.symbol}
              maxLength="1"
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.symbol}
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit">
            Сохранить
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AlphabetLetterEditModal;