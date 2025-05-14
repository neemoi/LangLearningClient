import React, { useState } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import API_CONFIG from '../../src/config';
import './RegisterModal.css';

const RegisterModal = ({ 
  show, 
  onHide, 
  onRegisterSuccess = () => {}, 
  setError = () => {},
  currentUser 
}) => {
  const [registerData, setRegisterData] = useState({
    userName: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    country: ''
  });
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') setPasswordErrors([]);
    setLocalError('');
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Минимум 8 символов');
    if (!/[A-Z]/.test(password)) errors.push('Заглавная буква');
    if (!/[a-z]/.test(password)) errors.push('Строчная буква');
    if (!/[0-9]/.test(password)) errors.push('Цифра');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('Спецсимвол');
    return errors;
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const checkUserExists = async (username, email) => {
    try {
      const usernameResponse = await fetch(`${API_CONFIG.BASE_URL}/api/users/by-username?userName=${encodeURIComponent(username)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      if (usernameResponse.ok) {
        return 'Пользователь с таким именем уже существует';
      }

      const emailResponse = await fetch(`${API_CONFIG.BASE_URL}/api/users/by-email?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      if (emailResponse.ok) {
        return 'Пользователь с таким email уже существует';
      }

      return null;
    } catch (err) {
      console.error('Ошибка при проверке пользователя:', err);
      return 'Ошибка при проверке существования пользователя';
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError('');
    setPasswordErrors([]);

    if (!currentUser || currentUser.role !== 'Admin') {
      setLocalError('Недостаточно прав для регистрации пользователей');
      setIsLoading(false);
      return;
    }

    const passwordErrs = validatePassword(registerData.password);
    if (passwordErrs.length > 0) {
      setPasswordErrors(passwordErrs);
      setIsLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setLocalError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(registerData.email)) {
      setLocalError('Некорректный email');
      setIsLoading(false);
      return;
    }

    try {
      const userExistsError = await checkUserExists(registerData.userName, registerData.email);
      if (userExistsError) {
        setLocalError(userExistsError);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },        
        body: JSON.stringify({
          userName: registerData.userName,
          email: registerData.email,
          password: registerData.password,
          confirmPassword: registerData.confirmPassword,
          country: registerData.country
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка регистрации');
      }

      if (typeof onRegisterSuccess === 'function') {
        onRegisterSuccess();
      }
      
      onHide();
      
      setRegisterData({
        userName: '', 
        email: '', 
        password: '', 
        confirmPassword: '', 
        country: ''
      });
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      setLocalError(err.message);
      if (typeof setError === 'function') {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      backdrop="static"
      className="register-modal"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Регистрация нового пользователя</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {localError && (
          <div className="alert alert-danger mb-3">
            {localError}
          </div>
        )}

        {passwordErrors.length > 0 && (
          <div className="alert alert-warning mb-3">
            <h6>Требования к паролю:</h6>
            <ul className="mb-0 ps-3">
              {passwordErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3">
            <Form.Label>Имя пользователя</Form.Label>
            <Form.Control
              type="text"
              name="userName"
              placeholder="Введите имя пользователя"
              value={registerData.userName}
              onChange={handleRegisterChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Введите email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Введите пароль"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
            />
            <Form.Text className="text-muted">
              Пароль должен содержать: минимум 8 символов, заглавные и строчные буквы, цифры, спецсимволы
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Подтверждение пароля</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              placeholder="Повторите пароль"
              value={registerData.confirmPassword}
              onChange={handleRegisterChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Страна</Form.Label>
            <Form.Control
              type="text"
              name="country"
              placeholder="Введите страну"
              value={registerData.country}
              onChange={handleRegisterChange}
              required
            />
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            disabled={isLoading}
            className="w-100 py-2"
          >
            {isLoading ? (
              <>
                <Spinner 
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Регистрация...
              </>
            ) : 'Зарегистрировать'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RegisterModal;