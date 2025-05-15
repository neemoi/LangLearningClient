import React, { useState } from 'react';
import { Modal, Button, Alert, FormControl, Form } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';

export const CreateModal = ({ show, onHide, formData, onChange, onSubmit }) => {
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      setError('Пожалуйста, заполните поле названия');
      return;
    }

    if (!formData.name.trim()) {
      setError('Название не может быть пустым');
      return;
    }

    setValidated(false);
    setError('');
    onSubmit();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Новая категория</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormControl
            required
            type="text"
            name="name"
            placeholder="Введите название"
            value={formData.name}
            onChange={onChange}
            className="mb-3"
            isInvalid={!!error}
          />
          {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" className="px-4">
            <FaPlus className="me-2" /> Создать
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export const EditModal = ({ show, onHide, formData, onChange, onSubmit, category }) => {
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      setError('Пожалуйста, заполните поле названия');
      return;
    }

    if (!formData.name.trim()) {
      setError('Название не может быть пустым');
      return;
    }

    setValidated(false);
    setError('');
    onSubmit();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Редактировать</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormControl
            required
            type="text"
            name="name"
            placeholder="Название категории"
            value={formData.name}
            onChange={onChange}
            className="mb-3"
            isInvalid={!!error}
          />
          {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" className="px-4">
            <FaEdit className="me-2" /> Сохранить
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export const DeleteModal = ({ show, onHide, onSubmit, category }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Удаление</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-3">
          Удалить категорию <strong>{category?.name || ''}</strong>?
        </p>
        <Alert variant="warning" className="mb-0">
          Все связанные слова будут удалены.
        </Alert>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button variant="danger" onClick={onSubmit} className="px-4">
          <FaTrashAlt className="me-2" /> Удалить
        </Button>
      </Modal.Footer>
    </Modal>
  );
};