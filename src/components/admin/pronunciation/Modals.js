import React, { useState } from 'react';
import { Modal, Button, Alert, FormControl, Form } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';

export const CreateCategoryModal = ({ show, onHide, formData, onChange, onSubmit }) => {
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Название категории обязательно');
      return;
    }
    setError('');
    onSubmit();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Новая категория</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group>
            <Form.Label>Название категории</Form.Label>
            <FormControl
              type="text"
              name="name"
              placeholder="Введите название"
              value={formData.name}
              onChange={onChange}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit">
            <FaPlus className="me-2" /> Создать
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export const EditCategoryModal = ({ show, onHide, formData, onChange, onSubmit, category }) => {
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Название категории обязательно');
      return;
    }
    setError('');
    onSubmit();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать категорию</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group>
            <Form.Label>Название категории</Form.Label>
            <FormControl
              type="text"
              name="name"
              placeholder="Введите название"
              value={formData.name}
              onChange={onChange}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit">
            <FaEdit className="me-2" /> Сохранить
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export const DeleteCategoryModal = ({ show, onHide, onSubmit, category }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Удаление категории</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Вы уверены, что хотите удалить категорию "{category?.name}"?</p>
        <Alert variant="warning">
          Все связанные слова также будут удалены.
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button variant="danger" onClick={onSubmit}>
          <FaTrashAlt className="me-2" /> Удалить
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export const CreateWordModal = ({ show, onHide, formData, onChange, onSubmit }) => {
  const [error, setError] = useState('');

  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Название слова обязательно');
      return;
    }
    if (!isValidUrl(formData.imagePath)) {
      setError('Некорректный URL изображения');
      return;
    }
    setError('');
    onSubmit();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Добавить слово</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Название слова</Form.Label>
            <FormControl
              type="text"
              name="name"
              placeholder="Введите название"
              value={formData.name}
              onChange={onChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>URL изображения</Form.Label>
            <FormControl
              type="text"
              name="imagePath"
              placeholder="Введите URL изображения"
              value={formData.imagePath}
              onChange={onChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit">
            <FaPlus className="me-2" /> Добавить
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export const EditWordModal = ({ show, onHide, formData, onChange, onSubmit, word }) => {
  const [error, setError] = useState('');

  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Название слова обязательно');
      return;
    }
    if (!isValidUrl(formData.imagePath)) {
      setError('Некорректный URL изображения');
      return;
    }
    setError('');
    onSubmit();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать слово</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Название слова</Form.Label>
            <FormControl
              type="text"
              name="name"
              placeholder="Введите название"
              value={formData.name}
              onChange={onChange}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>URL изображения</Form.Label>
            <FormControl
              type="text"
              name="imagePath"
              placeholder="Введите URL изображения"
              value={formData.imagePath}
              onChange={onChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit">
            <FaEdit className="me-2" /> Сохранить
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export const DeleteWordModal = ({ show, onHide, onSubmit, word }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Удаление слова</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Вы уверены, что хотите удалить слово "{word?.name}"?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button variant="danger" onClick={onSubmit}>
          <FaTrashAlt className="me-2" /> Удалить
        </Button>
      </Modal.Footer>
    </Modal>
  );
};