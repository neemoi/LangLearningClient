import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';

const KidWordCardModal = ({
  show,
  onHide,
  formData,
  errors,
  handleFormChange,
  handleSave,
  isEditing
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Редактировать карточку' : 'Добавить карточку'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Слово*</Form.Label>
            <Form.Control
              type="text"
              name="word"
              value={formData.word}
              onChange={handleFormChange}
              placeholder="Введите слово"
              isInvalid={!!errors.word}
            />
            <Form.Control.Feedback type="invalid">
              {errors.word}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>URL изображения*</Form.Label>
            <Form.Control
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleFormChange}
              placeholder="https://example.com/image.jpg"
              isInvalid={!!errors.imageUrl}
            />
            <Form.Control.Feedback type="invalid">
              {errors.imageUrl}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>URL аудио</Form.Label>
            <Form.Control
              type="url"
              name="audioUrl"
              value={formData.audioUrl}
              onChange={handleFormChange}
              placeholder="https://example.com/audio.mp3"
              isInvalid={!!errors.audioUrl}
            />
            <Form.Control.Feedback type="invalid">
              {errors.audioUrl}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          <FaTimes /> Отмена
        </Button>
        <Button variant="outline-success" onClick={handleSave}>
          <FaCheck /> {isEditing ? 'Сохранить' : 'Добавить'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default KidWordCardModal;