import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  Table, Pagination, InputGroup, FormControl, Button,
  Spinner, Badge, Card, Alert, Container, Modal, Form
} from 'react-bootstrap';
import { 
  FaSearch, FaSyncAlt, FaPlus, FaEye, FaEdit, FaTrashAlt, FaArrowLeft
} from 'react-icons/fa';
import API_CONFIG from '../../src/config';

const PAGE_SIZE = 10;

const KidLessonsList = ({ 
  lessons = [], 
  searchTerm = '', 
  setSearchTerm = () => {}, 
  currentPage = 1, 
  setCurrentPage = () => {}, 
  navigate, 
  error = '', 
  setError = () => {}, 
  refreshData = () => {},
  isLoading = false
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { filteredLessons, currentLessons, totalPages } = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const filtered = lessons.filter(lesson => 
      lesson.title.toLowerCase().includes(term) || 
      (lesson.description?.toLowerCase().includes(term))
    );
    
    const indexOfLast = currentPage * PAGE_SIZE;
    const indexOfFirst = indexOfLast - PAGE_SIZE;
    
    return {
      filteredLessons: filtered,
      currentLessons: filtered.slice(indexOfFirst, indexOfLast),
      totalPages: Math.ceil(filtered.length / PAGE_SIZE)
    };
  }, [lessons, searchTerm, currentPage]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData().finally(() => setIsRefreshing(false));
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/kid-lessons/${currentLesson.id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        }
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      setShowDeleteModal(false);
      await refreshData();
    } catch (err) {
      setError(err.message || 'Ошибка удаления урока');
    }
  };

  const prepareEditForm = (lesson = null) => {
    setCurrentLesson(lesson);
    setFormData({
      title: lesson?.title || '',
      description: lesson?.description || '',
      imageUrl: lesson?.imageUrl || ''
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const isValidUrl = (url) => {
    if (!url || url.trim() === '') return true;
    try {
      new URL(url);
      return /^https?:\/\//i.test(url);
    } catch {
      return false;
    }
  };

   const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Название обязательно';
    if (!formData.description.trim()) errors.description = 'Описание обязательно';
    
    if (!formData.imageUrl.trim()) {
      errors.imageUrl = 'URL изображения обязателен';
    } else if (!isValidUrl(formData.imageUrl)) {
      errors.imageUrl = 'Некорректный URL (должен начинаться с http:// или https://)';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveLesson = async () => {
    if (!validateForm()) return;
  
    try {
      const url = currentLesson 
        ? `${API_CONFIG.BASE_URL}/api/kid-lessons/${currentLesson.id}`
        : `${API_CONFIG.BASE_URL}/api/kid-lessons`;

      const method = currentLesson ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка сервера');
      }

      await refreshData();
      setShowEditModal(false);
    } catch (err) {
      setError(`Ошибка: ${err.message}`);
      console.error("Ошибка запроса:", err);
    }
  };

  return (
    <Container fluid className="lessons-management px-4 py-5">
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            {currentLesson ? 'Редактирование урока' : 'Создание урока'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">Название*</Form.Label>
              <Form.Control
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                isInvalid={!!validationErrors.title}
                className="py-2"
                required
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.title}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">Описание*</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                isInvalid={!!validationErrors.description}
                className="py-2"
                required
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.description}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">URL изображения*</Form.Label>
              <Form.Control
                type="url"
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={handleInputChange}
                isInvalid={!!validationErrors.imageUrl}
                className="py-2"
                required
              />
              <Form.Text className="text-muted">
                Обязательное поле. Должен быть валидным URL (начинаться с http:// или https://)
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                {validationErrors.imageUrl}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSaveLesson} className="px-4">
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Удаление урока</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">Вы уверены, что хотите удалить урок <strong>{currentLesson?.title}</strong>?</p>
          <Alert variant="warning" className="mb-0">
            Это действие нельзя отменить. Все связанные материалы будут удалены.
          </Alert>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDelete} className="px-4">
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="mb-5">
        <div className="d-flex align-items-center mb-4">
          <Button 
            variant="link" 
            onClick={() => navigate('/admin')} 
            className="text-muted p-0 d-flex align-items-center me-4"
          >
            <FaArrowLeft className="me-2" />
            <span className="fw-medium">Назад</span>
          </Button>
          <h1 className="h3 mb-0 fw-bold">Управление детскими уроками</h1>
        </div>
        
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <InputGroup className="flex-grow-1" style={{ maxWidth: '500px' }}>
                <InputGroup.Text className="bg-white">
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Поиск по урокам..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-start-0"
                />
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
                  onClick={() => prepareEditForm()}
                  className="d-flex align-items-center px-4"
                >
                  <FaPlus className="me-2" /> Создать урок
                </Button>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
                Всего: {lessons.length}
              </Badge>
              <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
                Найдено: {filteredLessons.length}
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
                  <th width="80" className="ps-4">ID</th>
                  <th>Название</th>
                  <th>Описание</th>
                  <th width="150" className="text-center pe-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : currentLessons.length > 0 ? (
                  currentLessons.map(lesson => (
                    <tr key={lesson.id}>
                      <td className="fw-semibold text-muted ps-4">{lesson.id}</td>
                      <td>
                        <div className="fw-bold">{lesson.title}</div>
                        {lesson.imageUrl && (
                          <img 
                            src={lesson.imageUrl} 
                            alt={lesson.title} 
                            style={{ width: 50, height: 50, objectFit: 'cover' }}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '300px' }}>
                          {lesson.description || '-'}
                        </div>
                      </td>
                      <td className="text-center pe-4">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/admin/kid-lessons/${lesson.id}`)}
                            className="px-2 py-1"
                          >
                            <FaEye />
                          </Button>
                          
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => prepareEditForm(lesson)}
                            className="px-2 py-1"
                          >
                            <FaEdit />
                          </Button>
                          
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setCurrentLesson(lesson);
                              setShowDeleteModal(true);
                            }}
                            className="px-2 py-1"
                          >
                            <FaTrashAlt />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="text-muted mb-3">
                        {searchTerm ? 'Ничего не найдено по вашему запросу' : 'Уроки не найдены'}
                      </div>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => prepareEditForm()}
                        className="px-3"
                      >
                        <FaPlus className="me-2" /> Создать первый урок
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
                Показано {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredLessons.length)} из {filteredLessons.length}
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
      </div>
    </Container>
  );
};

KidLessonsList.propTypes = {
  lessons: PropTypes.array.isRequired,
  searchTerm: PropTypes.string,
  setSearchTerm: PropTypes.func,
  currentPage: PropTypes.number,
  setCurrentPage: PropTypes.func,
  navigate: PropTypes.func.isRequired,
  error: PropTypes.string,
  setError: PropTypes.func,
  refreshData: PropTypes.func,
  isLoading: PropTypes.bool
};

KidLessonsList.defaultProps = {
  searchTerm: '',
  setSearchTerm: () => {},
  currentPage: 1,
  setCurrentPage: () => {},
  error: '',
  setError: () => {},
  refreshData: () => {},
  isLoading: false
};

export default KidLessonsList;