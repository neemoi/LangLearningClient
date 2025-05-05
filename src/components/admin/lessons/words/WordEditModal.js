import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaTimes, FaCheck } from 'react-icons/fa';

const WordEditModal = ({ 
  show, 
  onHide, 
  formData, 
  errors, 
  handleFormChange, 
  handleEditWord 
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Редактировать слово</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Слово*</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Введите слово"
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Перевод*</Form.Label>
            <Form.Control
              type="text"
              name="translation"
              value={formData.translation}
              onChange={handleFormChange}
              placeholder="Введите перевод"
              isInvalid={!!errors.translation}
            />
            <Form.Control.Feedback type="invalid">
              {errors.translation}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>URL изображения*</Form.Label>
            <Form.Control
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleFormChange}
              placeholder="Введите URL изображения"
              isInvalid={!!errors.imageUrl}
            />
            <Form.Control.Feedback type="invalid">
              {errors.imageUrl}
            </Form.Control.Feedback>
          </Form.Group>
          <input type="hidden" name="type" value="keyword" />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="btn btn-outline-secondary" onClick={onHide}>
          <FaTimes /> Отмена
        </Button>
        <Button variant="btn btn-outline-success" onClick={handleEditWord}>
          <FaCheck /> Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WordEditModal;