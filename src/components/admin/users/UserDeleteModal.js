import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import API_CONFIG from '../../src/config';

const UserDeleteModal = ({ show, user, onClose, onDelete, setError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkLocalStorage = () => {
      const keysToCheck = ['user', 'currentUser', 'userData'];
      for (const key of keysToCheck) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsedData = JSON.parse(data);
            if (parsedData.id && parsedData.role === 'Admin') {
              setCurrentUser(parsedData);
              return;
            }
          } catch (e) {
            console.error(`Ошибка парсинга данных из ${key}:`, e);
          }
        }
      }
      setLocalError('Данные администратора не найдены в localStorage');
    };

    checkLocalStorage();
  }, []);

  const handleDelete = async () => {
    if (!currentUser?.id) {
      setLocalError('Не удалось получить ID администратора');
      return;
    }

    try {
      setLoading(true);
      setLocalError(null);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/users/${user.id}?currentUserId=${currentUser.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 204) {
        onDelete();
        onClose();
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Ошибка ${response.status}`);
      }

      onDelete();
      onClose();
    } catch (err) {
      console.error('Ошибка при удалении:', err);
      setLocalError(err.message || 'Не удалось удалить пользователя');
      if (setError) setError(err.message);
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
          <strong>{user?.username || user?.email}</strong> ({user?.email})
        </p>

        {currentUser ? (
          <Alert variant="info">
            Действие выполняется от имени: {currentUser.username} (Роль: {currentUser.role})
          </Alert>
        ) : (
          <Alert variant="warning">
            Данные администратора не загружены. Проверьте localStorage.
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={loading || !currentUser}
        >
          {loading ? (
            <>
              <Spinner as="span" size="sm" animation="border" role="status" />
              <span className="ms-2">Удаление...</span>
            </>
          ) : (
            'Удалить'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserDeleteModal;