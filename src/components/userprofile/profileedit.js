import React, { useState } from 'react';
import { Form, Button, Accordion, FloatingLabel } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaUser, 
  FaMapMarkerAlt, 
  FaHeart,
} from 'react-icons/fa';
import API_CONFIG from '../src/config';

const ProfileEdit = ({ userData, setUserData, setError }) => {
  const [activeKey, setActiveKey] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = JSON.parse(localStorage.getItem('currentUser'))?.id;

    if (!userId) {
      setError('Не найден идентификатор пользователя.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить профиль');
      }
      
      toast.success('Профиль успешно обновлен!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      setError(error.message || 'Не удалось обновить профиль.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-edit-container">
      <Form onSubmit={handleSubmit}>
        <Accordion activeKey={activeKey} onSelect={(k) => setActiveKey(k)} flush>
          <Accordion.Item eventKey="general" className="mb-3 border-0">
            <Accordion.Header className="accordion-header">
              <div className="d-flex align-items-center">
                <div className="icon-bg me-3">
                  <FaUser className="text-primary" />
                </div>
                <span className="fw-bold">Основная информация</span>
              </div>
            </Accordion.Header>
            <Accordion.Body className="px-4 py-3">
              <FloatingLabel controlId="username" label="Имя пользователя" className="mb-3">
                <Form.Control 
                  type="text" 
                  name="userName" 
                  value={userData.userName || ''} 
                  onChange={handleInputChange}
                  placeholder="Имя пользователя"
                />
              </FloatingLabel>

              <div className="row">
                <div className="col-md-6">
                  <FloatingLabel controlId="firstName" label="Имя" className="mb-3">
                    <Form.Control 
                      type="text" 
                      name="firstName" 
                      value={userData.firstName || ''} 
                      onChange={handleInputChange}
                      placeholder="Имя"
                    />
                  </FloatingLabel>
                </div>
                <div className="col-md-6">
                  <FloatingLabel controlId="lastName" label="Фамилия" className="mb-3">
                    <Form.Control 
                      type="text" 
                      name="lastName" 
                      value={userData.lastName || ''} 
                      onChange={handleInputChange}
                      placeholder="Фамилия"
                    />
                  </FloatingLabel>
                </div>
              </div>

              <FloatingLabel controlId="birthDate" label="Дата рождения" className="mb-3">
                <Form.Control 
                  type="date" 
                  name="birthDate" 
                  value={userData.birthDate ? userData.birthDate.split('T')[0] : ''} 
                  onChange={handleInputChange}
                />
              </FloatingLabel>

              <FloatingLabel controlId="gender" label="Пол" className="mb-3">
                <Form.Select 
                  name="gender" 
                  value={userData.gender || ''} 
                  onChange={handleInputChange}
                >
                  <option value="">Выберите пол</option>
                  <option value="Male">Мужской</option>
                  <option value="Female">Женский</option>
                  <option value="Other">Другой</option>
                </Form.Select>
              </FloatingLabel>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="interest" className="mb-3 border-0">
            <Accordion.Header className="accordion-header">
              <div className="d-flex align-items-center">
                <div className="icon-bg me-3">
                  <FaHeart className="text-primary" />
                </div>
                <span className="fw-bold">Интересы</span>
              </div>
            </Accordion.Header>
            <Accordion.Body className="px-4 py-3">
              <FloatingLabel controlId="interests" label="Интересы" className="mb-3">
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  name="interests" 
                  value={userData.interests || ''} 
                  onChange={handleInputChange}
                  placeholder="Ваши интересы"
                  style={{ height: '100px' }}
                />
              </FloatingLabel>

              <FloatingLabel controlId="favoriteMovies" label="Любимые фильмы" className="mb-3">
                <Form.Control 
                  type="text" 
                  name="favoriteMovies" 
                  value={userData.favoriteMovies || ''} 
                  onChange={handleInputChange}
                  placeholder="Любимые фильмы"
                />
              </FloatingLabel>

              <FloatingLabel controlId="favoriteBooks" label="Любимые книги" className="mb-3">
                <Form.Control 
                  type="text" 
                  name="favoriteBooks" 
                  value={userData.favoriteBooks || ''} 
                  onChange={handleInputChange}
                  placeholder="Любимые книги"
                />
              </FloatingLabel>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="contact" className="mb-3 border-0">
            <Accordion.Header className="accordion-header">
              <div className="d-flex align-items-center">
                <div className="icon-bg me-3">
                  <FaMapMarkerAlt className="text-primary" />
                </div>
                <span className="fw-bold">Контактная информация</span>
              </div>
            </Accordion.Header>
            <Accordion.Body className="px-4 py-3">
              <FloatingLabel controlId="email" label="Email" className="mb-3">
                <Form.Control 
                  type="email" 
                  name="email" 
                  value={userData.email || ''} 
                  onChange={handleInputChange}
                  placeholder="Email"
                />
              </FloatingLabel>

              <div className="row">
                <div className="col-md-6">
                  <FloatingLabel controlId="city" label="Город" className="mb-3">
                    <Form.Control 
                      type="text" 
                      name="city" 
                      value={userData.city || ''} 
                      onChange={handleInputChange}
                      placeholder="Город"
                    />
                  </FloatingLabel>
                </div>
                <div className="col-md-6">
                  <FloatingLabel controlId="country" label="Страна" className="mb-3">
                    <Form.Control 
                      type="text" 
                      name="country" 
                      value={userData.country || ''} 
                      onChange={handleInputChange}
                      placeholder="Страна"
                    />
                  </FloatingLabel>
                </div>
              </div>

              <FloatingLabel controlId="website" label="Вебсайт" className="mb-3">
                <Form.Control 
                  type="url" 
                  name="website" 
                  value={userData.website || ''} 
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </FloatingLabel>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <div className="d-flex justify-content-end mt-4">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isSubmitting}
            className="px-4 py-2 fw-medium rounded-pill"
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Сохранение...
              </>
            ) : 'Сохранить изменения'}
          </Button>
        </div>
      </Form>

      <ToastContainer />
    </div>
  );
};

export default ProfileEdit;