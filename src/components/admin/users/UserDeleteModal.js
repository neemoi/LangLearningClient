import React, { useState } from 'react';
import { 
  Modal, 
  Button, 
  Form, 
  Spinner, 
  Alert 
} from 'react-bootstrap';

const UserDeleteModal = ({ show, user, onClose, onDelete, setError }) => {
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState(null);

  const handleDelete = async () => {
    if (!currentUserId) {
      setLocalError('Введите ID администратора для подтверждения');
      return;
    }

    try {
      setLoading(true);
      setLocalError(null);
      
      const response = await fetch(
        `https://localhost:7119/api/users/${user.id}?currentUserId=${currentUserId}`,
        { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      );

      if (response.status === 204) { 
        onDelete();
        onClose();
        return;
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.message || `Ошибка ${response.status}: ${response.statusText}`);
      }

      onDelete();
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
      setLocalError(err.message || 'Произошла ошибка при удалении');
      setError(err.message || 'Произошла ошибка при удалении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Подтверждение удаления</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <p>
          Вы собираетесь удалить пользователя:
          <br />
          <strong>{user?.userName}</strong> ({user?.email})
        </p>
        
        <Form.Group className="mb-3">
          <Form.Label>
            Введите ваш ID администратора для подтверждения:
          </Form.Label>
          <Form.Control
            type="text"
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            placeholder="ID администратора"
            disabled={loading}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onClose}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button 
          variant="danger" 
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              <span className="ms-2">Удаление...</span>
            </>
          ) : 'Удалить'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserDeleteModal;