import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaQuestionCircle, 
  FaUser, 
  FaClock, 
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaHeart,
  FaArrowLeft
} from 'react-icons/fa';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/BasicQuestionsPage.css';
import API_CONFIG from '../../../components/src/config';

const BasicQuestionsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/MainQuestions/categories`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (id) => {
    navigate(`/mini-lessons/basic-questions/${id}`);
  };

  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return <FaQuestionCircle />;
    
    const iconMap = {
      'who': <FaUser />,
      'what': <FaQuestionCircle />,
      'when': <FaClock />,
      'where': <FaMapMarkerAlt />,
      'why': <FaQuestionCircle />,
      'how': <FaQuestionCircle />,
      'which': <FaQuestionCircle />,
      'time': <FaClock />,
      'date': <FaCalendarAlt />,
      'shopping': <FaShoppingBag />,
      'love': <FaHeart />
    };

    const lowerName = categoryName.toLowerCase();
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(keyword)) {
        return icon;
      }
    }
    
    return <FaQuestionCircle />;
  };

  if (loading) {
    return (
      <div className="basic-questions-page">
        <Navigation
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <Sidebar isOpen={sidebarOpen} />
        <main className={`basic-questions-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="basic-questions-loading">Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="basic-questions-page">
        <Navigation
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <Sidebar isOpen={sidebarOpen} />
        <main className={`basic-questions-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="basic-questions-error">Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="basic-questions-page">
      <Navigation
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`basic-questions-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="basic-questions-container">
          <header className="basic-questions-header">
            <Link to="/lessonsVirtual/1" className="basic-questions-back-btn">
              <FaArrowLeft className="back-icon" /> Назад к уроку
            </Link>
          </header>

          <h1 className="basic-questions-title">Основные вопросы</h1>

          {categories.length === 0 ? (
            <div className="basic-questions-empty">Нет доступных категорий</div>
          ) : (
            <div className="basic-questions-grid">
              {categories.map((category, index) => (
                <div
                  key={category.id || index}
                  className="basic-questions-card"
                  onClick={() => handleCategoryClick(category.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleCategoryClick(category.id)}
                >
                  <div className="basic-questions-thumb">
                    {category.imagePath ? (
                      <img
                        src={category.imagePath}
                        alt={category.name}
                        className="basic-questions-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="basic-questions-icon-fallback">
                      {getCategoryIcon(category.name)}
                    </div>
                    <span className="basic-questions-badge">
                      {category.words?.length || 0}
                    </span>
                  </div>
                  <h3 className="basic-questions-name">{category.name}</h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BasicQuestionsPage;