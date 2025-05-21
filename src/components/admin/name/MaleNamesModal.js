import React from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaMale } from 'react-icons/fa';

const MaleNamesModal = ({ 
  show, 
  handleClose, 
  handleSubmit, 
  englishNames,
  selectedGenderName, 
  handleInputChange,
  error,
  setError,
  isEditing
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaMale className="me-2" />
          {isEditing ? 'Редактировать мужское имя' : 'Добавить мужское имя'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Английское имя *</Form.Label>
            <Form.Select
              name="englishNameId"
              value={selectedGenderName?.englishNameId || ''}
              onChange={handleInputChange}
              required
              disabled={isEditing}
            >
              <option value="">Выберите английское имя</option>
              {englishNames.map(name => (
                <option key={name.id} value={name.id}>{name.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Мужское имя *</Form.Label>
            <Form.Control
              type="text"
              name="name" 
              value={selectedGenderName?.name || ''}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              {isEditing ? 'Обновить' : 'Добавить'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default MaleNamesModal;