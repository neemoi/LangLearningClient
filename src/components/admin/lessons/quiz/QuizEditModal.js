// QuizEditModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import API_CONFIG from '../../../src/config';

const QuizEditModal = ({ show, onHide, quiz, lessonId, onEditQuiz }) => {
  const [formData, setFormData] = useState({
    type: 'nouns'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (quiz) {
      setFormData({
        type: quiz.type || 'nouns'
      });
    }
  }, [quiz]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditQuiz = async () => {
    if (!quiz?.id) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/LessonQuiz`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: quiz.id,
          lessonId: parseInt(lessonId),
          type: formData.type
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при редактировании теста');
      }

      const updatedQuiz = await response.json();
      onEditQuiz(updatedQuiz);
      onHide();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Редактировать тест</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Тип теста</Form.Label>
            <Form.Select
              name="type"
              value={formData.type}
              onChange={handleFormChange}
            >
              <option value="nouns">Существительные</option>
              <option value="grammar">Грамматика</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
          <FaTimes /> Отмена
        </Button>
        <Button 
          variant="primary" 
          onClick={handleEditQuiz} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            <FaCheck />
          )}
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QuizEditModal;