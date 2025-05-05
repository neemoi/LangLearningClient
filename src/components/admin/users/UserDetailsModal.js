import React from 'react';
import { 
  Modal, 
  Button, 
  Badge, 
  Card, 
  ListGroup 
} from 'react-bootstrap';
import { 
  FaUser, 
  FaEnvelope, 
  FaBirthdayCake, 
  FaCity, 
  FaGlobe,
  FaLock,
  FaUserCheck
} from 'react-icons/fa';

const UserDetailsModal = ({ show, user, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="text-dark">
          <FaUser className="me-2" />
          Информация о пользователе
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {user && (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex align-items-center py-3 px-4">
                  <FaUser className="me-3 text-primary" size={20} />
                  <div>
                    <h6 className="mb-1 text-muted">Имя пользователя</h6>
                    <p className="mb-0 fs-5">{user.userName || 'Не указано'}</p>
                  </div>
                </ListGroup.Item>
                
                <ListGroup.Item className="d-flex align-items-center py-3 px-4">
                  <FaEnvelope className="me-3 text-primary" size={20} />
                  <div>
                    <h6 className="mb-1 text-muted">Email</h6>
                    <p className="mb-0 fs-5">{user.email || 'Не указан'}</p>
                  </div>
                </ListGroup.Item>
                
                {user.firstName && user.lastName && (
                  <ListGroup.Item className="d-flex align-items-center py-3 px-4">
                    <FaUser className="me-3 text-primary" size={20} />
                    <div>
                      <h6 className="mb-1 text-muted">Полное имя</h6>
                      <p className="mb-0 fs-5">{user.firstName} {user.lastName}</p>
                    </div>
                  </ListGroup.Item>
                )}
                
                {user.birthDate && (
                  <ListGroup.Item className="d-flex align-items-center py-3 px-4">
                    <FaBirthdayCake className="me-3 text-primary" size={20} />
                    <div>
                      <h6 className="mb-1 text-muted">Дата рождения</h6>
                      <p className="mb-0 fs-5">{user.birthDate}</p>
                    </div>
                  </ListGroup.Item>
                )}
                
                {user.city && (
                  <ListGroup.Item className="d-flex align-items-center py-3 px-4">
                    <FaCity className="me-3 text-primary" size={20} />
                    <div>
                      <h6 className="mb-1 text-muted">Город</h6>
                      <p className="mb-0 fs-5">{user.city}</p>
                    </div>
                  </ListGroup.Item>
                )}
                
                {user.country && (
                  <ListGroup.Item className="d-flex align-items-center py-3 px-4">
                    <FaGlobe className="me-3 text-primary" size={20} />
                    <div>
                      <h6 className="mb-1 text-muted">Страна</h6>
                      <p className="mb-0 fs-5">{user.country}</p>
                    </div>
                  </ListGroup.Item>
                )}
                
                <ListGroup.Item className="d-flex align-items-center py-3 px-4">
                  <div className="me-3">
                    <Badge 
                      bg={user.isBlocked ? 'danger' : 'success'} 
                      className="d-flex align-items-center p-2"
                    >
                      {user.isBlocked ? (
                        <FaLock className="me-1" />
                      ) : (
                        <FaUserCheck className="me-1" />
                      )}
                    </Badge>
                  </div>
                  <div>
                    <h6 className="mb-1 text-muted">Статус</h6>
                    <p className="mb-0 fs-5">
                      {user.isBlocked ? 'Заблокирован' : 'Активен'}
                    </p>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer className="border-top-0">
        <Button 
          variant="outline-secondary" 
          onClick={onClose}
          className="px-4"
        >
          Закрыть
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserDetailsModal;