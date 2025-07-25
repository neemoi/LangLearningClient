import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaLanguage, 
  FaUtensils, 
  FaTshirt, 
  FaHome, 
  FaTree, 
  FaBus, 
  FaBook, 
  FaPaw,
  FaGamepad,
  FaMusic,
  FaArrowLeft
} from 'react-icons/fa';
import Navigation from '../../../components/layout/Navigation/Navigation';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import './css/PronunciationPage.css';
import API_CONFIG from '../../../components/src/config';

const PronunciationPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/');
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/Pronunciation/categories`);
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
  }, [navigate]);

  if (!localStorage.getItem('currentUser')) {
    return null;
  }

  const handleCategoryClick = (id) => {
    navigate(`/pronunciation/${id}`);
  };

  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return <FaLanguage />;
    
    const iconMap = {
      'еда': <FaUtensils />,
      'продукты': <FaUtensils />,
      'одежда': <FaTshirt />,
      'дом': <FaHome />,
      'жилье': <FaHome />,
      'природа': <FaTree />,
      'транспорт': <FaBus />,
      'образование': <FaBook />,
      'учеба': <FaBook />,
      'животные': <FaPaw />,
      'игры': <FaGamepad />,
      'спорт': <FaGamepad />,
      'музыка': <FaMusic />,
      'искусство': <FaMusic />
    };

    const lowerName = categoryName.toLowerCase();
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(keyword)) {
        return icon;
      }
    }
    
    return <FaLanguage />;
  };

  if (loading) {
    return (
      <div className="pronunciation-lesson-page">
        <Navigation
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <Sidebar isOpen={sidebarOpen} />
        <main className={`pronunciation-lesson-main ${sidebarOpen ? 'with-sidebar' : 'without-sidebar'}`}>
          <div className="pronunciation-lesson-loading">Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pronunciation-lesson-page">
        <Navigation
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <Sidebar isOpen={sidebarOpen} />
        <main className={`pronunciation-lesson-main ${sidebarOpen ? 'with-sidebar' : 'without-sidebar'}`}>
          <div className="pronunciation-lesson-error">Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="pronunciation-lesson-page">
      <Navigation
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`pronunciation-lesson-main ${sidebarOpen ? 'with-sidebar' : 'without-sidebar'}`}>
        <div className="pronunciation-lesson-container">
          <header className="pronunciation-lesson-header">
            <Link to="/lessonsVirtual/1" className="pronunciation-lesson-back-btn">
              <FaArrowLeft className="pronunciation-lesson-back-icon" /> Назад к уроку
            </Link>
          </header>

          <h1 className="pronunciation-lesson-title">Произношение</h1>

          {categories.length === 0 ? (
            <div className="pronunciation-lesson-empty">Нет доступных категорий</div>
          ) : (
            <div className="pronunciation-lesson-grid">
              {categories.map((category, index) => (
                <div
                  key={category.id || index}
                  className="pronunciation-lesson-card"
                  onClick={() => handleCategoryClick(category.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleCategoryClick(category.id)}
                >
                  <div className="pronunciation-lesson-thumb">
                    {category.wordItems?.[0]?.imagePath ? (
                      <img
                        src={category.wordItems[0].imagePath}
                        alt={category.name}
                        className="pronunciation-lesson-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="pronunciation-lesson-icon">
                      {getCategoryIcon(category.name)}
                    </div>
                    <span className="pronunciation-lesson-badge">
                      {category.wordItems?.length || 0}
                    </span>
                  </div>
                  <h3 className="pronunciation-lesson-card-title">{category.name}</h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PronunciationPage;