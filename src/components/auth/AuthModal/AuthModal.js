import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import './AuthModal.css';

const AuthModal = ({ show, onHide, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [resetData, setResetData] = useState({ email: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const timer = message ? setTimeout(() => setMessage(null), 3000) : null;
    return () => timer && clearTimeout(timer);
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (activeTab === 'login' && (!loginData.email || !loginData.password)) {
      setMessage({ text: 'Заполните все поля', type: 'error' });
      setLoading(false);
      return;
    }

    if (activeTab === 'reset' && !resetData.email) {
      setMessage({ text: 'Введите email', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      if (activeTab === 'login') {
        const response = await fetch('https://localhost:7119/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailOrUserName: loginData.email,
            password: loginData.password
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || 'Неверный email или пароль');
        }

        const data = await response.json();

        if (data.isBlocked) {
          throw new Error('Ваш аккаунт заблокирован');
        }

        localStorage.setItem('userToken', data.token);
        const user = {
          id: data.id,
          email: data.email,
          username: data.username,
          role: data.role,
          isBlocked: data.isBlocked
        };
        localStorage.setItem('currentUser', JSON.stringify(user));

        onLoginSuccess(user);
        onHide();
      } else {
        const response = await fetch('https://localhost:7119/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resetData.email })
        });

        if (!response.ok) {
          throw new Error('Не удалось отправить письмо');
        }

        setMessage({
          text: `Инструкции отправлены на ${resetData.email}`,
          type: 'success'
        });
        setResetData({ email: '' });
      }
    } catch (err) {
      setMessage({
        text: err.message.includes('Failed to fetch') 
          ? 'Ошибка соединения с сервером' 
          : err.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        onHide();
        setActiveTab('login');
      }}
      centered
      backdrop="static"
      className="auth-modal"
    >
      <Modal.Body className="p-4">
        <div className="d-flex mb-4">
          <button
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Вход
          </button>
          <button
            className={`tab-btn ${activeTab === 'reset' ? 'active' : ''}`}
            onClick={() => setActiveTab('reset')}
          >
            Восстановить
          </button>
        </div>

        {message && (
          <div className={`alert-message ${message.type} mb-3`}>
            {message.text}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          {activeTab === 'login' ? (
            <>
              <Form.Control
                type="email"
                placeholder="Введите ваш email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="auth-input mb-3"
                required
              />
              <Form.Control
                type="password"
                placeholder="Введите пароль"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="auth-input mb-3"
                required
              />
              <div className="text-end mb-3">
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setActiveTab('reset')}
                >
                  Не помню пароль
                </button>
              </div>
            </>
          ) : (
            <>
              <Form.Control
                type="email"
                placeholder="Введите email для восстановления"
                value={resetData.email}
                onChange={(e) => setResetData({ email: e.target.value })}
                className="auth-input mb-3"
                required
              />
              <div className="text-end mb-3">
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setActiveTab('login')}
                >
                  Вернуться к входу
                </button>
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="submit-btn w-100"
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                <span>Загрузка...</span>
              </>
            ) : (
              activeTab === 'login' ? 'Войти' : 'Отправить'
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;