import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaTimes, FaCheck } from 'react-icons/fa';

const PhraseAddModal = ({
  show,
  onHide,
  formData,
  errors,
  handleFormChange,
  handleAddPhrase
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Добавить новую фразу</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Фраза*</Form.Label>
            <Form.Control
              type="text"
              name="phraseText"
              value={formData.phraseText}
              onChange={handleFormChange}
              placeholder="Введите фразу"
              isInvalid={!!errors.phraseText}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phraseText}
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
            <Form.Label>URL изображения</Form.Label>
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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          <FaTimes /> Отмена
        </Button>
        <Button variant="outline-success" onClick={handleAddPhrase}>
          <FaCheck /> Добавить
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PhraseAddModal;