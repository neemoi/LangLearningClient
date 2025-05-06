import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Form, Alert, Spinner, Container, Card, Overlay, Tooltip } from 'react-bootstrap';
import API_CONFIG from '../../src/config';
import './PasswordResetPage.css';

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const passwordRef = React.useRef(null);

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) errors.push('Минимум 8 символов');
    if (!/[A-Z]/.test(password)) errors.push('Хотя бы одна заглавная буква');
    if (!/[a-z]/.test(password)) errors.push('Хотя бы одна строчная буква');
    if (!/[0-9]/.test(password)) errors.push('Хотя бы одна цифра');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('Хотя бы один спецсимвол');
    
    return errors;
  };

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    if (!emailParam || !tokenParam) {
      setError('Неверная или устаревшая ссылка');
      setIsValidLink(false);
      return;
    }
    
    try {
      setEmail(decodeURIComponent(emailParam));
      setToken(decodeURIComponent(tokenParam));
      setIsValidLink(true);
    } catch (err) {
      setError('Неверные параметры ссылки');
      setIsValidLink(false);
    }
  }, [searchParams]);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordErrors(validatePassword(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    if (passwordErrors.length > 0) {
      setError('Пароль не соответствует требованиям');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          newPassword,
          confirmPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Не удалось сбросить пароль');
      }

      setSuccessMessage('Пароль успешно изменен! Перенаправляем на страницу входа...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Не удалось сбросить пароль. Запросите новую ссылку.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Container className="auth-container">
        <Card className="auth-card">
          <Card.Body>
            <div className="auth-header">
              <h2 className="auth-title">Сброс пароля</h2>
              <p className="auth-subtitle">Создайте новый пароль для вашего аккаунта</p>
            </div>
            
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible className="auth-alert">{error}</Alert>}
            {successMessage && <Alert variant="success" className="auth-alert">{successMessage}</Alert>}
            
            {isValidLink ? (
              <Form onSubmit={handleSubmit} className="auth-form">
                <Form.Group className="mb-3 auth-form-group">
                  <Form.Control 
                    type="email" 
                    value={email}
                    readOnly
                    className="auth-input"
                  />
                </Form.Group>

                <Form.Group className="mb-3 auth-form-group" ref={passwordRef}>
                  <Form.Control 
                    type="password" 
                    placeholder="Введите новый пароль"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    className="auth-input"
                    required
                    isInvalid={passwordErrors.length > 0}
                    onFocus={() => setShowTooltip(true)}
                    onBlur={() => setShowTooltip(false)}
                  />
                  <Overlay
                    target={passwordRef.current}
                    show={showTooltip}
                    placement="right"
                  >
                    {(props) => (
                      <Tooltip id="password-tooltip" {...props}>
                        <div style={{ textAlign: 'left' }}>
                          <strong>Требования к паролю:</strong>
                          <div className={newPassword.length >= 8 ? 'text-success' : 'text-danger'}>
                            • Минимум 8 символов
                          </div>
                          <div className={/[A-Z]/.test(newPassword) ? 'text-success' : 'text-danger'}>
                            • Хотя бы одна заглавная буква
                          </div>
                          <div className={/[a-z]/.test(newPassword) ? 'text-success' : 'text-danger'}>
                            • Хотя бы одна строчная буква
                          </div>
                          <div className={/[0-9]/.test(newPassword) ? 'text-success' : 'text-danger'}>
                            • Хотя бы одна цифра
                          </div>
                          <div className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-success' : 'text-danger'}>
                            • Хотя бы один спецсимвол
                          </div>
                        </div>
                      </Tooltip>
                    )}
                  </Overlay>
                </Form.Group>

                <Form.Group className="mb-3 auth-form-group">
                  <Form.Control 
                    type="password" 
                    placeholder="Повторите новый пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input"
                    required
                    isInvalid={confirmPassword && newPassword !== confirmPassword}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <Form.Control.Feedback type="invalid">
                      Пароли не совпадают
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isLoading || passwordErrors.length > 0} 
                  className="auth-button"
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Обработка...</span>
                    </>
                  ) : 'Сбросить пароль'}
                </Button>
              </Form>
            ) : (
              <div className="auth-footer">
                <Button 
                  variant="link" 
                  onClick={() => navigate('/forgot-password')}
                  className="auth-link-button"
                >
                  Запросить новую ссылку
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PasswordResetPage;