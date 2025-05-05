import React from 'react';
import { Card } from 'react-bootstrap';

const UserDashboard = ({ user }) => (
  <Card className="user-dashboard mt-4">
    <Card.Body>
      <Card.Title>Информация</Card.Title>
      <Card.Text>
        <strong>Имя пользователя:</strong> {user.username}<br />
        <strong>Email:</strong> {user.email}<br />
        <strong>Роль:</strong> {user.role}
      </Card.Text>
    </Card.Body>
  </Card>
);

export default UserDashboard;