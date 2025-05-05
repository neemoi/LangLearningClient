import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaBirthdayCake, FaVenusMars, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';

const ProfileView = ({ userData }) => {
  return (
    <Card className="profile-view-card border-0">
      <Card.Header className="text-white">
        <h5 className="mb-0">Информация о профиле</h5>
      </Card.Header>
      <Card.Body className="pt-5">
        <div className="profile-picture-container">
          <img 
            src={userData.profilePictureUrl} 
            alt="" 
            className="profile-picture"
          />
        </div>
        
        <ListGroup variant="flush" className="border-top">
          <ListGroup.Item>
            <strong><FaUser className="me-2 text-primary" />Имя пользователя:</strong> {userData.userName}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong><FaEnvelope className="me-2 text-primary" />Электронная почта:</strong> {userData.email}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong><FaUser className="me-2 text-primary" />Полное имя:</strong> {userData.firstName} {userData.lastName}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong><FaBirthdayCake className="me-2 text-primary" />Дата рождения:</strong> 
            {userData.birthDate ? new Date(userData.birthDate).toLocaleDateString('ru-RU') : 'Не указана'}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong><FaVenusMars className="me-2 text-primary" />Пол:</strong> {userData.gender || 'Не указан'}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong><FaMapMarkerAlt className="me-2 text-primary" />Местоположение:</strong> 
            {userData.city || 'Не указан'}, {userData.country || 'Не указана'}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong><FaHeart className="me-2 text-primary" />Интересы:</strong> 
            {userData.interests || 'Не указаны'}
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default ProfileView;