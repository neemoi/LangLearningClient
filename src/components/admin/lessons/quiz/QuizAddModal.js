import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import API_CONFIG from '../../../src/config';

const QuizAddModal = ({ show, onHide, lessonId, onAddQuiz }) => {
  const [formData, setFormData] = useState({
    type: 'nouns'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddQuiz = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/LessonQuiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: parseInt(lessonId),
          type: formData.type
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при добавлении теста');
      }

      const newQuiz = await response.json();
      onAddQuiz(newQuiz);
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
        <Modal.Title>Добавить новый тест</Modal.Title>
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
          onClick={handleAddQuiz} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            <FaCheck />
          )}
          Добавить
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QuizAddModal;