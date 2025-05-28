import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaBook, 
  FaFont,
  FaCogs,
  FaVolumeUp,
  FaQuestion,
  FaUserTag,
  FaChild
} from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Административная панель</h1>
      </div>
      
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2 className="section-title">Основные разделы</h2>
          <div className="section-grid">

            <Link to="/admin/lessons" className="dashboard-card highlighted">
              <div className="card-icon bg-success">
                <FaBook />
              </div>
              <div className="card-content">
                <h3>Управление уроками</h3>
                <p>Создание и редактирование учебных материалов</p>
              </div>
            </Link>

            <Link to="/admin/kid-lessons" className="dashboard-card">
              <div className="card-icon bg-warning">
                <FaChild />
              </div>
              <div className="card-content">
                <h3>Уроки gFriend Kids</h3>
                <p>Специальные уроки для детской аудитории</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Контент и настройки</h2>
          <div className="section-grid">
            <Link to="/admin/users" className="dashboard-card">
              <div className="card-icon bg-primary">
                <FaUsers />
              </div>
              <div className="card-content">
                <h3>Управление пользователями</h3>
                <p>Просмотр и редактирование пользователей системы</p>
              </div>
            </Link>
            
            <Link to="/admin/alphabet" className="dashboard-card">
              <div className="card-icon bg-info">
                <FaFont />
              </div>
              <div className="card-content">
                <h3>Буквы алфавита</h3>
                <p>Управление буквами и связанными изображениями</p>
              </div>
            </Link>

            <Link to="/admin/functions" className="dashboard-card">
              <div className="card-icon bg-secondary">
                <FaCogs />
              </div>
              <div className="card-content">
                <h3>Грамматические разделы</h3>
                <p>Управление грамматическими функциями</p>
              </div>
            </Link>

            <Link to="/admin/pronunciation" className="dashboard-card">
              <div className="card-icon bg-danger">
                <FaVolumeUp />
              </div>
              <div className="card-content">
                <h3>Произношение</h3>
                <p>Категории и слова для тренировки</p>
              </div>
            </Link>

            <Link to="/admin/questions" className="dashboard-card">
              <div className="card-icon bg-purple">
                <FaQuestion />
              </div>
              <div className="card-content">
                <h3>Управление вопросами</h3>
                <p>Добавление и редактирование вопросов</p>
              </div>
            </Link>

            <Link to="/admin/names" className="dashboard-card">
              <div className="card-icon bg-indigo">
                <FaUserTag />
              </div>
              <div className="card-content">
                <h3>Управление именами</h3>
                <p>Добавление и редактирование имен</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;