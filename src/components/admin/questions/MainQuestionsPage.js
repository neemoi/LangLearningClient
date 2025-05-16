import React, { useState, useEffect } from 'react';
import { 
  Modal, Button, Table, Form, Alert, Spinner, 
  Badge, InputGroup, FloatingLabel, Card, Container, Stack
} from 'react-bootstrap';
import { 
  FaEdit, FaTrashAlt, FaPlus, 
  FaSyncAlt, FaSearch, FaArrowLeft, FaList, FaImage 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../../src/config';
import WordsModal from './WordsModal';

const MainQuestionsPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showWordsModal, setShowWordsModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    id: 0,
    name: '',
    imagePath: ''
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const BASE_API_URL = `${API_CONFIG.BASE_URL}/api/MainQuestions`;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${BASE_API_URL}/categories`);
      
      if (!response.ok) throw new Error('Ошибка загрузки категорий');
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setCurrentCategory({
      id: 0,
      name: '',
      imagePath: ''
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleShowWords = (category) => {
    setSelectedCategory(category);
    setShowWordsModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      setError('');
      
      if (!currentCategory.name.trim()) {
        throw new Error('Название категории обязательно');
      }

      const url = isEditing ? `${BASE_API_URL}` : `${BASE_API_URL}/categories`;
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          id: currentCategory.id,
          name: currentCategory.name,
          imagePath: currentCategory.imagePath || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка ${isEditing ? 'обновления' : 'добавления'} категории`);
      }
      
      await fetchCategories();
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) return;
    
    try {
      const response = await fetch(`${BASE_API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) throw new Error('Ошибка удаления категории');
      await fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="main-questions px-4 py-5">
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5">
            {isEditing ? 'Редактировать категорию' : 'Новая категория'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <FloatingLabel controlId="categoryName" label="Название категории" className="mb-3">
              <Form.Control
                type="text"
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                placeholder="Введите название"
                className="border-0 border-bottom rounded-0"
              />
            </FloatingLabel>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <FloatingLabel controlId="imagePath" label="Ссылка на изображение">
              <Form.Control
                type="text"
                value={currentCategory.imagePath}
                onChange={(e) => setCurrentCategory({...currentCategory, imagePath: e.target.value})}
                placeholder="Введите URL изображения"
                className="border-0 border-bottom rounded-0"
              />
            </FloatingLabel>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="light" 
            onClick={() => setShowModal(false)}
            className="px-4"
          >
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveCategory}
            className="px-4"
          >
            {isEditing ? 'Сохранить' : 'Добавить'}
          </Button>
        </Modal.Footer>
      </Modal>

      <WordsModal 
        show={showWordsModal} 
        category={selectedCategory} 
        onHide={() => setShowWordsModal(false)} 
      />

      <div className="mb-5">
        <div className="d-flex align-items-center mb-4">
          <Button 
            variant="link" 
            onClick={() => navigate(-1)} 
            className="text-muted p-0 d-flex align-items-center me-4"
          >
            <FaArrowLeft className="me-2" />
            <span className="fw-medium">Назад</span>
          </Button>
          <h1 className="h4 mb-0 fw-bold">Категории основных вопросов</h1>
        </div>
        
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
              <InputGroup className="flex-grow-1">
                <InputGroup.Text className="bg-white border-end-0">
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Поиск по названию"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>

              <div className="d-flex gap-2">
                <Button 
                  variant="light" 
                  onClick={fetchCategories}
                  className="px-3"
                >
                  <FaSyncAlt />
                </Button>
                
                <Button 
                  variant="primary" 
                  onClick={handleAddCategory}
                  className="d-flex align-items-center px-3"
                >
                  <FaPlus className="me-1" /> Добавить
                </Button>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Badge bg="light" text="dark" className="px-2 py-1 fw-normal">
                Всего: {categories.length}
              </Badge>
              <Badge bg="light" text="dark" className="px-2 py-1 fw-normal">
                Найдено: {filteredCategories.length}
              </Badge>
            </div>
          </Card.Body>
        </Card>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
            {error}
          </Alert>
        )}

        <Card className="border-0 shadow-sm">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th width="60">ID</th>
                  <th>Название</th>
                  <th width="120" className="text-center">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map(category => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td className="fw-bold">
                        <div className="d-flex align-items-center">
                          {category.name}
                          {category.imagePath && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 ms-2 text-muted"
                              href={category.imagePath} 
                              target="_blank"
                              title="Просмотреть изображение"
                            >
                              <FaImage size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                      <td>
                        <Stack direction="horizontal" gap={2} className="justify-content-center">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleShowWords(category)}
                            title="Слова"
                            className="px-2"
                          >
                            <FaList />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            title="Редактировать"
                            className="px-2"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            title="Удалить"
                            className="px-2"
                          >
                            <FaTrashAlt />
                          </Button>
                        </Stack>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-5">
                      <div className="text-muted mb-3">
                        {searchTerm ? 'Ничего не найдено' : 'Нет категорий'}
                      </div>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={handleAddCategory}
                      >
                        <FaPlus className="me-1" /> Добавить категорию
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default MainQuestionsPage;