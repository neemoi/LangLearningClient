import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Административная панель</h1>
      <div className="admin-menu">
        <Link to="/admin/users" className="admin-menu-item">
          <h2>Управление пользователями</h2>
          <p>Просмотр, добавление и редактирование пользователей</p>
        </Link>
        
        <Link to="/admin/lessons" className="admin-menu-item">
          <h2>Управление уроками</h2>
          <p>Создание и редактирование учебных материалов</p>
        </Link>
        
        <Link to="/admin/statistics" className="admin-menu-item">
          <h2>Статистика</h2>
          <p>Анализ активности пользователей</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;