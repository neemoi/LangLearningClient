import React from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaFemale } from 'react-icons/fa';

const FemaleNamesModal = ({ 
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
          <FaFemale className="me-2" />
          {isEditing ? 'Редактировать женское имя' : 'Добавить женское имя'}
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
            <Form.Label>Женское имя *</Form.Label>
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

export default FemaleNamesModal;