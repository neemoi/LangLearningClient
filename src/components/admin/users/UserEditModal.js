import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Button, 
  Form, 
  Row, 
  Col, 
  Spinner,
  Alert
} from 'react-bootstrap';

const UserEditModal = ({ show, user, onClose, onSave, setError }) => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    city: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [duplicateErrors, setDuplicateErrors] = useState({
    userName: false,
    email: false
  });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        birthDate: user.birthDate?.split('T')[0] || '',
        gender: user.gender || '',
        city: user.city || '',
        country: user.country || ''
      });
    }
    setDuplicateErrors({ userName: false, email: false });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (duplicateErrors[name]) {
      setDuplicateErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.userName.trim()) errors.userName = 'Обязательное поле';
    if (!formData.email.trim()) errors.email = 'Обязательное поле';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Некорректный email';
    }
    return errors;
  };

  const checkFieldExists = async (field, value) => {
    try {
      const endpoint = field === 'userName' 
        ? `https://localhost:7119/api/users/by-username?userName=${encodeURIComponent(value)}`
        : `https://localhost:7119/api/users/by-email?email=${encodeURIComponent(value)}`;

      const response = await fetch(endpoint);
      
      if (response.status === 404) return false;
      if (!response.ok) throw new Error('Ошибка проверки данных');
      
      const data = await response.json();
      return data.id !== user?.id;
    } catch (err) {
      console.error(`Ошибка проверки ${field}:`, err);
      return false;
    }
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsChecking(true);
      setLoading(true);
      
      const checks = [];
      if (formData.userName !== user.userName) {
        checks.push(checkFieldExists('userName', formData.userName));
      }
      if (formData.email !== user.email) {
        checks.push(checkFieldExists('email', formData.email));
      }

      const results = await Promise.all(checks);
      
      const newDuplicateErrors = {
        userName: results[0] || false,
        email: checks.length > 1 ? results[1] : false
      };

      if (newDuplicateErrors.userName || newDuplicateErrors.email) {
        setDuplicateErrors(newDuplicateErrors);
        return;
      }

      const response = await fetch(`https://localhost:7119/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления');
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsChecking(false);
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Редактирование пользователя</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(duplicateErrors.userName || duplicateErrors.email) && (
          <Alert variant="danger" className="mb-3">
            {duplicateErrors.userName && <div>Это имя пользователя уже занято!</div>}
            {duplicateErrors.email && <div>Этот email уже используется!</div>}
          </Alert>
        )}

        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Имя пользователя *</Form.Label>
                <Form.Control
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  isInvalid={!!formErrors.userName || duplicateErrors.userName}
                  disabled={isChecking}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.userName || (duplicateErrors.userName && 'Имя уже используется')}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!formErrors.email || duplicateErrors.email}
                  disabled={isChecking}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.email || (duplicateErrors.email && 'Email уже используется')}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Имя</Form.Label>
                <Form.Control
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isChecking}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Фамилия</Form.Label>
                <Form.Control
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isChecking}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Дата рождения</Form.Label>
                <Form.Control
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  disabled={isChecking}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Пол</Form.Label>
                <Form.Control
                  as="select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isChecking}
                >
                  <option value="">Не указан</option>
                  <option value="Male">Мужской</option>
                  <option value="Female">Женский</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Город</Form.Label>
                <Form.Control
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={isChecking}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Страна</Form.Label>
                <Form.Control
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={isChecking}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button variant="btn btn-outline-dark" onClick={handleSubmit} disabled={loading || isChecking}>
          {loading ? (
            <>
              <Spinner as="span" size="sm" animation="border" />
              <span className="ms-2">Сохранение...</span>
            </>
          ) : 'Сохранить'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserEditModal;