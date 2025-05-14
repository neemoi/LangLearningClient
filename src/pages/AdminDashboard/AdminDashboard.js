import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaBook, 
  FaFont,
  FaCogs
} from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Административная панель</h1>
      <div className="dashboard-grid">
        <Link to="/admin/users" className="dashboard-card">
          <div className="card-icon bg-primary">
            <FaUsers size={24} />
          </div>
          <div className="card-content">
            <h2>Управление пользователями</h2>
            <p>Просмотр, добавление и редактирование пользователей системы</p>
          </div>
        </Link>
        
        <Link to="/admin/lessons" className="dashboard-card">
          <div className="card-icon bg-success">
            <FaBook size={24} />
          </div>
          <div className="card-content">
            <h2>Управление уроками</h2>
            <p>Создание и редактирование учебных материалов</p>
          </div>
        </Link>
        
        <Link to="/admin/alphabet" className="dashboard-card">
          <div className="card-icon bg-info">
            <FaFont size={24} />
          </div>
          <div className="card-content">
            <h2>Буквы алфавита</h2>
            <p>Управление буквами и связанными изображениями</p>
          </div>
        </Link>

        <Link to="/admin/functions" className="dashboard-card">
          <div className="card-icon bg-warning">
            <FaCogs size={24} />
          </div>
          <div className="card-content">
            <h2>Функции (Грамматические разделы)</h2>
            <p>Управление грамматическими разделами</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;