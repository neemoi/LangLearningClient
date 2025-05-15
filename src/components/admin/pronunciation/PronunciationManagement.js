import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Container, Alert, Spinner, Table, Button, 
  Badge, Pagination, Card, InputGroup, 
  FormControl, Modal, Form
} from 'react-bootstrap';
import { 
  FaEdit, FaTrashAlt, FaPlus,
  FaSearch, FaSyncAlt, FaVolumeUp, FaEye,
  FaArrowLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AdminStyles.css';
import API_CONFIG from '../../src/config';

const PronunciationManagement = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [modalState, setModalState] = useState({
    showCategoryCreate: false,
    showCategoryEdit: false,
    showCategoryDelete: false,
    showWordCreate: false,
    showWordEdit: false,
    showWordDelete: false,
    showWordsList: false,
    selectedItem: null
  });

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [wordForm, setWordForm] = useState({ 
    id: 0,
    name: '', 
    imagePath: '', 
    categoryId: null 
  });

  const [formErrors, setFormErrors] = useState({
    name: false,
    imagePath: false
  });

  const safeFetch = async (url, options = {}) => {
    try {
      console.log('Sending request to:', url, 'with options:', options);
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await safeFetch(`${API_CONFIG.BASE_URL}/api/Pronunciation/categories`);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchWords = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      const data = await safeFetch(
        `${API_CONFIG.BASE_URL}/api/Pronunciation/categories/${categoryId}/words`
      );
      setWords(Array.isArray(data) ? data : []);
      setSelectedCategory(categories.find(c => c.id === categoryId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateWordForm = () => {
    const errors = {
      name: !wordForm.name.trim(),
      imagePath: !isValidUrl(wordForm.imagePath)
    };
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleCreateCategory = async () => {
    try {
      if (!categoryForm.name.trim()) {
        setError('Название категории обязательно');
        return;
      }

      const newCategory = await safeFetch(`${API_CONFIG.BASE_URL}/api/Pronunciation/categories`, {
        method: 'POST',
        body: JSON.stringify({
          name: categoryForm.name
        })
      });
      
      setCategories(prev => [...prev, newCategory]);
      setModalState(prev => ({ ...prev, showCategoryCreate: false }));
      setCategoryForm({ name: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateCategory = async () => {
    try {
      if (!categoryForm.name.trim()) {
        setError('Название категории обязательно');
        return;
      }

      const updatedCategory = await safeFetch(
        `${API_CONFIG.BASE_URL}/api/Pronunciation/categories/${modalState.selectedItem.id}`, 
        {
          method: 'PUT',
          body: JSON.stringify({
            id: modalState.selectedItem.id,
            name: categoryForm.name
          })
        }
      );
      
      setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
      setModalState(prev => ({ ...prev, showCategoryEdit: false }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await safeFetch(
        `${API_CONFIG.BASE_URL}/api/Pronunciation/categories/${modalState.selectedItem.id}`, 
        { method: 'DELETE' }
      );
      setCategories(prev => prev.filter(c => c.id !== modalState.selectedItem.id));
      setModalState(prev => ({ ...prev, showCategoryDelete: false }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateWord = async () => {
    if (!validateWordForm()) {
      setError('Пожалуйста, заполните все поля корректно');
      return;
    }

    try {
      const newWord = await safeFetch(`${API_CONFIG.BASE_URL}/api/Pronunciation/categories/words`, {
        method: 'POST',
        body: JSON.stringify({
          ...wordForm,
          categoryId: selectedCategory.id
        })
      });
      
      setWords(prev => [...prev, newWord]);
      setModalState(prev => ({ ...prev, showWordCreate: false }));
      setWordForm({ name: '', imagePath: '', categoryId: null });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateWord = async () => {
    if (!validateWordForm()) {
      setError('Пожалуйста, заполните все поля корректно');
      return;
    }

    try {
      const updatedWord = await safeFetch(
        `${API_CONFIG.BASE_URL}/api/Pronunciation/words`, 
        {
          method: 'PATCH',
          body: JSON.stringify(wordForm)
        }
      );
      
      setWords(prev => prev.map(w => w.id === updatedWord.id ? updatedWord : w));
      setModalState(prev => ({ ...prev, showWordEdit: false }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteWord = async () => {
    try {
      await safeFetch(
        `${API_CONFIG.BASE_URL}/api/Pronunciation/words/${modalState.selectedItem.id}`, 
        { method: 'DELETE' }
      );
      setWords(prev => prev.filter(w => w.id !== modalState.selectedItem.id));
      setModalState(prev => ({ ...prev, showWordDelete: false }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (selectedCategory) {
      fetchWords(selectedCategory.id);
    } else {
      fetchCategories();
    }
  };

  const handleShowWords = (category) => {
    setSelectedCategory(category);
    fetchWords(category.id);
    setModalState(prev => ({ ...prev, showWordsList: true }));
  };

  const { filteredItems, currentItems, totalPages } = useMemo(() => {
    const filtered = categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    
    return {
      filteredItems: filtered,
      currentItems: filtered.slice(indexOfFirst, indexOfLast),
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  }, [categories, searchTerm, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading && categories.length === 0) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="admin-management px-4 py-5">
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="link" 
          onClick={() => navigate(-1)} 
          className="text-muted p-0 d-flex align-items-center me-4"
        >
          <FaArrowLeft className="me-2" />
          <span className="fw-medium">Назад</span>
        </Button>
        <h1 className="h3 mb-0 fw-bold">Категории произношения</h1>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <InputGroup className="flex-grow-1" style={{ maxWidth: '500px' }}>
              <InputGroup.Text className="bg-white">
                <FaSearch className="text-muted" />
              </InputGroup.Text>
              <FormControl
                placeholder="Поиск по категориям"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0"
              />
              {searchTerm && (
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    setSearchTerm('');
                    fetchCategories();
                  }}
                >
                  Очистить
                </Button>
              )}
            </InputGroup>

            <div className="d-flex gap-3">
              <Button 
                variant="light" 
                onClick={handleRefresh}
                className="px-3"
                disabled={isRefreshing}
              >
                <FaSyncAlt className={isRefreshing ? 'spin' : ''} />
              </Button>
              
              <Button 
                variant="primary" 
                onClick={() => setModalState({ ...modalState, showCategoryCreate: true })}
                className="d-flex align-items-center px-4"
              >
                <FaPlus className="me-2" /> Добавить категорию
              </Button>
            </div>
          </div>

          <div className="d-flex gap-2">
            <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
              Всего: {categories.length}
            </Badge>
            <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
              Найдено: {filteredItems.length}
            </Badge>
          </div>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th width="60" className="ps-4">ID</th>
                <th>Категория</th>
                <th width="100">Слова</th>
                <th width="200" className="text-center pe-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map(category => (
                  <tr key={category.id}>
                    <td className="align-middle ps-4">{category.id}</td>
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <FaVolumeUp className="me-2 text-muted" />
                        {category.name}
                      </div>
                    </td>
                    <td className="align-middle">
                      <Badge bg="info" className="py-2">{category.wordItems?.length || 0}</Badge>
                    </td>
                    <td className="align-middle pe-4">
                      <div className="d-flex justify-content-center gap-2 action-buttons">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleShowWords(category)}
                          className="px-2 py-1 action-btn"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            setCategoryForm({ name: category.name });
                            setModalState({
                              ...modalState,
                              showCategoryEdit: true,
                              selectedItem: category
                            });
                          }}
                          className="px-2 py-1 action-btn"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setModalState({
                            ...modalState,
                            showCategoryDelete: true,
                            selectedItem: category
                          })}
                          className="px-2 py-1 action-btn"
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <div className="text-muted mb-3">
                      {searchTerm ? 'Ничего не найдено по вашему запросу' : 'Нет категорий'}
                    </div>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => setModalState({ ...modalState, showCategoryCreate: true })}
                      className="px-3"
                    >
                      <FaPlus className="me-2" /> Добавить категорию
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top">
            <div className="text-muted small mb-2 mb-md-0">
              Показано {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredItems.length)} из {filteredItems.length}
            </div>
            <Pagination className="mb-0">
              <Pagination.Prev 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              />
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let page;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                
                return (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Pagination.Item>
                );
              })}
              <Pagination.Next 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              />
            </Pagination>
          </div>
        )}
      </Card>

      <Modal 
        show={modalState.showCategoryCreate} 
        onHide={() => setModalState({...modalState, showCategoryCreate: false})}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Новая категория</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleCreateCategory();
          }}>
            <Form.Group>
              <Form.Label>Название</Form.Label>
              <FormControl
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ name: e.target.value })}
                required
                isInvalid={!categoryForm.name.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Поле обязательно для заполнения
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setModalState({...modalState, showCategoryCreate: false})}
          >
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateCategory}
            disabled={!categoryForm.name.trim()}
          >
            Создать
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={modalState.showCategoryEdit} 
        onHide={() => setModalState({...modalState, showCategoryEdit: false})}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Редактировать категорию</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateCategory();
          }}>
            <Form.Group>
              <Form.Label>Название</Form.Label>
              <FormControl
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ name: e.target.value })}
                required
                isInvalid={!categoryForm.name.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Поле обязательно для заполнения
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setModalState({...modalState, showCategoryEdit: false})}
          >
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateCategory}
            disabled={!categoryForm.name.trim()}
          >
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={modalState.showCategoryDelete} 
        onHide={() => setModalState({...modalState, showCategoryDelete: false})}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Удалить категорию</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Вы уверены, что хотите удалить категорию <strong>{modalState.selectedItem?.name}</strong>?
          </p>
          <Alert variant="warning" className="mb-0">
            Все связанные слова также будут удалены.
          </Alert>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setModalState({...modalState, showCategoryDelete: false})}
          >
            Отмена
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteCategory}
          >
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={modalState.showWordsList} 
        onHide={() => setModalState({...modalState, showWordsList: false})}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Слова в категории: {selectedCategory?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between mb-3">
            <Button 
              variant="primary"
              onClick={() => {
                setWordForm({ 
                  name: '',
                  imagePath: '',
                  categoryId: selectedCategory.id 
                });
                setModalState({
                  ...modalState,
                  showWordsList: false,
                  showWordCreate: true
                });
              }}
            >
              <FaPlus /> Добавить слово
            </Button>
          </div>
          
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Слово</th>
                <th>URL изображения</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {words.length > 0 ? (
                words.map(word => (
                  <tr key={word.id}>
                    <td>{word.id}</td>
                    <td>{word.name}</td>
                    <td>
                      {word.imagePath ? (
                        <a href={word.imagePath} target="_blank" rel="noopener noreferrer">
                          {word.imagePath}
                        </a>
                      ) : (
                        <Badge bg="secondary">Нет изображения</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            setWordForm({ 
                              id: word.id,
                              name: word.name, 
                              imagePath: word.imagePath,
                              categoryId: word.categoryId
                            });
                            setModalState({
                              ...modalState,
                              showWordsList: false,
                              showWordEdit: true
                            });
                          }}
                          className="px-2 py-1 action-btn"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setModalState({
                              ...modalState,
                              showWordsList: false,
                              showWordDelete: true,
                              selectedItem: word
                            });
                          }}
                          className="px-2 py-1 action-btn"
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-3">
                    <div className="text-muted mb-3">Нет слов в этой категории</div>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => {
                        setWordForm({ 
                          name: '',
                          imagePath: '',
                          categoryId: selectedCategory.id 
                        });
                        setModalState({
                          ...modalState,
                          showWordsList: false,
                          showWordCreate: true
                        });
                      }}
                      className="px-3"
                    >
                      <FaPlus className="me-2" /> Добавить слово
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setModalState({...modalState, showWordsList: false})}
          >
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={modalState.showWordCreate} 
        onHide={() => setModalState({...modalState, showWordCreate: false})}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Добавить слово</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleCreateWord();
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Слово</Form.Label>
              <FormControl
                type="text"
                name="name"
                value={wordForm.name}
                onChange={(e) => setWordForm({...wordForm, name: e.target.value})}
                required
                isInvalid={formErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                Поле обязательно для заполнения
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>URL изображения</Form.Label>
              <FormControl
                type="text"
                name="imagePath"
                value={wordForm.imagePath}
                onChange={(e) => setWordForm({...wordForm, imagePath: e.target.value})}
                placeholder="https://example.com/image.jpg"
                isInvalid={formErrors.imagePath}
              />
              <Form.Control.Feedback type="invalid">
                Введите корректный URL
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setModalState({...modalState, showWordCreate: false})}
          >
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateWord}
          >
            Добавить
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={modalState.showWordEdit} 
        onHide={() => setModalState({...modalState, showWordEdit: false})}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Редактировать слово</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateWord();
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Слово</Form.Label>
              <FormControl
                type="text"
                name="name"
                value={wordForm.name}
                onChange={(e) => setWordForm({...wordForm, name: e.target.value})}
                required
                isInvalid={formErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                Поле обязательно для заполнения
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>URL изображения</Form.Label>
              <FormControl
                type="text"
                name="imagePath"
                value={wordForm.imagePath}
                onChange={(e) => setWordForm({...wordForm, imagePath: e.target.value})}
                isInvalid={formErrors.imagePath}
              />
              <Form.Control.Feedback type="invalid">
                Введите корректный URL
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setModalState({...modalState, showWordEdit: false})}
          >
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateWord}
          >
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={modalState.showWordDelete} 
        onHide={() => setModalState({...modalState, showWordDelete: false})}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Удалить слово</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Вы уверены, что хотите удалить слово <strong>{modalState.selectedItem?.name}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setModalState({...modalState, showWordDelete: false})}
          >
            Отмена
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteWord}
          >
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PronunciationManagement;