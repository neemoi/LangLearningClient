import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaBook, 
  FaFont,
  FaCogs,
  FaVolumeUp,
  FaQuestion,
  FaUserTag
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

        <Link to="/admin/pronunciation" className="dashboard-card">
          <div className="card-icon bg-danger">
            <FaVolumeUp size={24} />
          </div>
          <div className="card-content">
            <h2>Управление произношением</h2>
            <p>Категории и слова для тренировки произношения</p>
          </div>
        </Link>

        <Link to="/admin/questions" className="dashboard-card">
          <div className="card-icon" style={{ backgroundColor: '#fc4a1a' }}>
            <FaQuestion size={24} />
          </div>
          <div className="card-content">
            <h2>Управление вопросами</h2>
            <p>Добавление и редактирование вопросов и тем</p>
          </div>
        </Link>

         <Link to="/admin/names" className="dashboard-card">
          <div className="card-icon" style={{ backgroundColor: '#6a5acd' }}>
            <FaUserTag size={24} />
          </div>
          <div className="card-content">
            <h2>Управление именами</h2>
            <p>Добавление и редактирование английских имен</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;