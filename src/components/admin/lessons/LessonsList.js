import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  Table, Pagination, InputGroup, FormControl, Button,
  Spinner, Badge, Card, Alert, Container, Modal, Form
} from 'react-bootstrap';
import { 
  FaSearch, FaSyncAlt, FaPlus, FaEye, FaEdit, FaTrashAlt, FaArrowLeft
} from 'react-icons/fa';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const PAGE_SIZE = 10;

const LessonsList = ({ error = '', setError = () => {} }) => {
  const [lessons, setLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    pdfUrl: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const fetchLessons = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://localhost:7119/api/Lessons');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setLessons(data);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Ошибка загрузки уроков:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [setError]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return /^https?:\/\//i.test(url);
    } catch {
      return false;
    }
  };

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
    fetchLessons();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`https://localhost:7119/api/Lessons/${currentLesson.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      setShowDeleteModal(false);
      await fetchLessons();
    } catch (err) {
      setError(err.message || 'Ошибка удаления урока');
    }
  };

  const prepareEditForm = (lesson = null) => {
    setCurrentLesson(lesson);
    setFormData({
      title: lesson?.title || '',
      description: lesson?.description || '',
      videoUrl: lesson?.videoUrl || '',
      pdfUrl: lesson?.pdfUrl || ''
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Название обязательно';
    if (formData.videoUrl && !isValidUrl(formData.videoUrl)) {
      errors.videoUrl = 'Некорректный URL (должен начинаться с http:// или https://)';
    }
    if (formData.pdfUrl && !isValidUrl(formData.pdfUrl)) {
      errors.pdfUrl = 'Некорректный URL (должен начинаться с http:// или https://)';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveLesson = async () => {
    if (!validateForm()) return;

    try {
      const url = currentLesson 
        ? `https://localhost:7119/api/Lessons/${currentLesson.id}`
        : 'https://localhost:7119/api/Lessons';
      
      const method = currentLesson ? 'PUT' : 'POST';
      const body = currentLesson
        ? { ...currentLesson, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await fetchLessons();
      setShowEditModal(false);
    } catch (err) {
      setError(err.message || 'Ошибка сохранения урока');
    }
  };

  if (isLoading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="lessons-management px-4 py-5">
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentLesson ? 'Редактирование урока' : 'Создание урока'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Название*</Form.Label>
              <Form.Control
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                isInvalid={!!validationErrors.title}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.title}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ссылка на видео</Form.Label>
              <Form.Control
                type="url"
                name="videoUrl"
                placeholder="https://example.com/video"
                value={formData.videoUrl}
                onChange={handleInputChange}
                isInvalid={!!validationErrors.videoUrl}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.videoUrl}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ссылка на PDF</Form.Label>
              <Form.Control
                type="url"
                name="pdfUrl"
                placeholder="https://example.com/document.pdf"
                value={formData.pdfUrl}
                onChange={handleInputChange}
                isInvalid={!!validationErrors.pdfUrl}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.pdfUrl}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSaveLesson}>
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Удаление урока</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Вы уверены, что хотите удалить урок <strong>{currentLesson?.title}</strong>?</p>
          <Alert variant="warning">
            Это действие нельзя отменить. Все связанные материалы будут удалены.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <div>
              <Button 
                variant="link" 
                onClick={() => navigate('/admin')} 
                className="text-secondary mb-2 p-0 d-flex align-items-center"
              >
                <FaArrowLeft className="me-2" /> Назад
              </Button>
              <h1 className="h3 mb-0 text-primary">
                <span className="fw-bold">Управление уроками</span>
              </h1>
            </div>
            
            <div className="d-flex mt-3 mt-md-0">
              <OverlayTrigger overlay={<Tooltip>Обновить список</Tooltip>}>
                <Button 
                  variant="light" 
                  onClick={handleRefresh} 
                  className="me-2"
                  disabled={isRefreshing}
                >
                  <FaSyncAlt className={isRefreshing ? 'spin' : ''} />
                </Button>
              </OverlayTrigger>
              
              <Button 
                variant="primary" 
                onClick={() => prepareEditForm()}
                className="d-flex align-items-center"
              >
                <FaPlus className="me-2" /> Создать урок
              </Button>
            </div>
          </div>

          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
            <InputGroup className="flex-grow-1" style={{ maxWidth: '500px' }}>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <FormControl
                placeholder="Поиск по урокам..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </InputGroup>

            <div className="d-flex gap-2">
              <Badge bg="light" text="dark" pill className="px-3 py-2">
                Всего: {lessons.length}
              </Badge>
              <Badge bg="light" text="dark" pill className="px-3 py-2">
                Найдено: {filteredLessons.length}
              </Badge>
            </div>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th width="80">ID</th>
                <th>Название</th>
                <th>Описание</th>
                <th width="150" className="text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              {currentLessons.length > 0 ? (
                currentLessons.map(lesson => (
                  <tr key={lesson.id}>
                    <td className="fw-semibold text-muted">{lesson.id}</td>
                    <td>
                      <div className="fw-bold">{lesson.title}</div>
                      <small className="text-muted">
                        {new Date(lesson.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '300px' }}>
                        {lesson.description || '-'}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <OverlayTrigger overlay={<Tooltip>Просмотр</Tooltip>}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/admin/lessons/${lesson.id}`)}
                          >
                            <FaEye />
                          </Button>
                        </OverlayTrigger>
                        
                        <OverlayTrigger overlay={<Tooltip>Редактировать</Tooltip>}>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => prepareEditForm(lesson)}
                          >
                            <FaEdit />
                          </Button>
                        </OverlayTrigger>
                        
                        <OverlayTrigger overlay={<Tooltip>Удалить</Tooltip>}>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setCurrentLesson(lesson);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FaTrashAlt />
                          </Button>
                        </OverlayTrigger>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="text-muted mb-3">
                      {searchTerm ? 'Ничего не найдено' : 'Нет уроков'}
                    </div>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => prepareEditForm()}
                    >
                      <FaPlus className="me-2" /> Создать урок
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
    </Container>
  );
};

LessonsList.propTypes = {
  error: PropTypes.string,
  setError: PropTypes.func.isRequired
};

LessonsList.defaultProps = {
  error: ''
};

export default LessonsList;