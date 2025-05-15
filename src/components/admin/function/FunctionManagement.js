import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Table, Button, Spinner, Badge, Alert,
  InputGroup, FormControl, Card, Modal, Form
} from 'react-bootstrap';
import { 
  FaSearch, FaSyncAlt, FaPlus, FaEdit, FaTrashAlt, 
  FaArrowLeft, FaList, FaTimes
} from 'react-icons/fa';
import API_CONFIG from '../../src/config';
import './FunctionManagement.css';

const PartsOfSpeechManagement = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showPartModal, setShowPartModal] = useState(false);
  const [currentPart, setCurrentPart] = useState(null);
  const [modalAction, setModalAction] = useState('add');

  const [showWordsModal, setShowWordsModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [wordsLoading, setWordsLoading] = useState(false);

  const fetchParts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/PartOfSpeech`);
      if (!response.ok) throw new Error('Ошибка загрузки частей речи');
      const data = await response.json();
      setParts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleAddPart = () => {
    setCurrentPart(null);
    setModalAction('add');
    setShowPartModal(true);
  };

  const handleEditPart = (part) => {
    setCurrentPart(part);
    setModalAction('edit');
    setShowPartModal(true);
  };

  const handleSavePart = async (partData) => {
    try {
      const url = `${API_CONFIG.BASE_URL}/api/PartOfSpeech`;
      const method = modalAction === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(partData)
      });

      if (!response.ok) {
        throw new Error(`Ошибка ${modalAction === 'add' ? 'добавления' : 'обновления'} части речи`);
      }
      
      await fetchParts();
      setShowPartModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePart = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту часть речи? Все связанные слова также будут удалены!')) return;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/PartOfSpeech/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) throw new Error('Ошибка удаления части речи');
      await fetchParts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShowWords = (part) => {
    setSelectedPart(part);
    setShowWordsModal(true);
  };

  const filteredParts = parts.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="parts-management px-4 py-5">
      <PartOfSpeechModal
        show={showPartModal}
        part={currentPart}
        onHide={() => setShowPartModal(false)}
        onSave={handleSavePart}
        action={modalAction}
        existingParts={parts}
      />

      <FunctionWordsModal
        show={showWordsModal}
        partOfSpeech={selectedPart}
        onHide={() => setShowWordsModal(false)}
        onWordsUpdated={fetchParts}
      />

      <div className="mb-5">
        <div className="d-flex align-items-center mb-4">
          <Button 
            variant="link" 
            onClick={() => window.history.back()} 
            className="text-muted p-0 d-flex align-items-center me-4"
          >
            <FaArrowLeft className="me-2" />
            <span className="fw-medium">Назад</span>
          </Button>
          <h1 className="h3 mb-0 fw-bold">Управление частями речи</h1>
        </div>
        
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <InputGroup className="flex-grow-1" style={{ maxWidth: '500px' }}>
                <InputGroup.Text className="bg-white">
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Поиск по названию"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>

              <div className="d-flex gap-3">
                <Button 
                  variant="light" 
                  onClick={fetchParts}
                  className="px-3"
                >
                  <FaSyncAlt />
                </Button>
                
                <Button 
                  variant="primary" 
                  onClick={handleAddPart}
                  className="d-flex align-items-center px-4"
                >
                  <FaPlus className="me-2" /> Добавить часть речи
                </Button>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
                Всего: {parts.length}
              </Badge>
              <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
                Найдено: {filteredParts.length}
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
                  <th width="200" className="text-center pe-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.length > 0 ? (
                  filteredParts.map(part => (
                    <tr key={part.id}>
                      <td className="align-middle ps-4">{part.id}</td>
                      <td className="align-middle fw-bold">{part.name}</td>
                      <td className="align-middle pe-4">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowWords(part)}
                            className="px-2 py-1"
                            title="Функциональные слова"
                          >
                            <FaList />
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleEditPart(part)}
                            className="px-2 py-1"
                            title="Редактировать"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeletePart(part.id)}
                            className="px-2 py-1"
                            title="Удалить"
                          >
                            <FaTrashAlt />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-5">
                      <div className="text-muted mb-3">
                        {searchTerm ? 'Ничего не найдено' : 'Нет частей речи'}
                      </div>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={handleAddPart}
                        className="px-3"
                      >
                        <FaPlus className="me-2" /> Добавить часть речи
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

const PartOfSpeechModal = ({ show, part, onHide, onSave, action, existingParts }) => {
  const [formData, setFormData] = useState({
    id: 0,
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (part) {
      setFormData({
        id: part.id,
        name: part.name
      });
    } else {
      setFormData({
        id: 0,
        name: ''
      });
    }
    setErrors({});
    setFormError('');
  }, [part]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    } else if (
      action === 'add' && 
      existingParts.some(p => p.name.toLowerCase() === formData.name.toLowerCase())
    ) {
      newErrors.name = 'Такая часть речи уже существует';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await onSave(formData);
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>{action === 'add' ? 'Добавление части речи' : 'Редактирование части речи'}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          {formError && (
            <Alert variant="danger" dismissible onClose={() => setFormError('')}>
              {formError}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Название *</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              isInvalid={!!errors.name}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit">
            {action === 'add' ? 'Добавить' : 'Сохранить'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

const FunctionWordsModal = ({ show, partOfSpeech, onHide, onWordsUpdated }) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editWord, setEditWord] = useState(null);
  const [editForm, setEditForm] = useState({
    id: 0,
    name: '',
    translation: ''
  });
  const [errors, setErrors] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    translation: '',
    partOfSpeechId: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (show && partOfSpeech) {
      fetchWords();
      setAddForm(prev => ({ ...prev, partOfSpeechId: partOfSpeech.id }));
    }
  }, [show, partOfSpeech]);

  const fetchWords = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/PartOfSpeech/${partOfSpeech?.id}/words`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Ошибка загрузки слов');
      
      const data = await response.json();
      setWords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredWords = words.filter(word => 
    word.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (word.translation && word.translation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteWord = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это слово?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/Language/function-word/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) throw new Error('Ошибка удаления слова');
      
      await fetchWords();
      onWordsUpdated && onWordsUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditWord = (word) => {
    setEditWord(word);
    setEditForm({
      id: word.id,
      name: word.name,
      translation: word.translation || ''
    });
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditWord(null);
    setEditForm({
      id: 0,
      name: '',
      translation: ''
    });
    setErrors({});
  };

  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editForm.name.trim()) newErrors.name = 'Слово обязательно';
    if (!editForm.translation.trim()) newErrors.translation = 'Перевод обязателен';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateEditForm()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/Language/function-word`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          id: editForm.id,
          name: editForm.name,
          translation: editForm.translation,
          partOfSpeechId: partOfSpeech.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления слова');
      }
      
      await fetchWords();
      onWordsUpdated && onWordsUpdated();
      handleCancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 const handleAddWord = async () => {
  try {
    if (!addForm.name.trim() || !addForm.translation.trim()) {
      setError('Заполните все обязательные поля');
      return;
    }

    setLoading(true);
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/Language/function-word`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
      },
      body: JSON.stringify({
        name: addForm.name,
        translation: addForm.translation,
        partOfSpeechId: partOfSpeech.id
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка добавления слова');
    }
    
    await fetchWords();
    onWordsUpdated && onWordsUpdated();
    setShowAddModal(false);
    setAddForm({
      name: '',
      translation: '',
      partOfSpeechId: partOfSpeech.id
    });
    setError('');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="words-modal">
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>
          Функциональные слова: <span className="text-primary">{partOfSpeech?.name}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
            {error}
          </Alert>
        )}

        <div className="d-flex justify-content-between mb-3">
          <InputGroup style={{ maxWidth: '400px' }}>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Поиск по словам или переводам"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <div className="d-flex gap-2">
            <Button 
              variant="light" 
              onClick={fetchWords} 
              disabled={loading}
            >
              <FaSyncAlt className={loading ? "spin" : ""} />
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setShowAddModal(true)}
              disabled={loading}
            >
              <FaPlus className="me-2" /> Добавить слово
            </Button>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2">Загрузка слов...</div>
            </div>
          ) : words.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted mb-3">Нет слов для этой части речи</div>
            </div>
          ) : filteredWords.length > 0 ? (
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th width="80">ID</th>
                  <th>Слово</th>
                  <th>Перевод</th>
                  <th width="150" className="text-center">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredWords.map(word => (
                  <tr key={word.id}>
                    <td className="align-middle">{word.id}</td>
                    <td className="align-middle fw-semibold">
                      {editWord?.id === word.id ? (
                        <>
                          <Form.Control
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            isInvalid={!!errors.name}
                          />
                          {errors.name && (
                            <Form.Text className="text-danger">{errors.name}</Form.Text>
                          )}
                        </>
                      ) : (
                        word.name
                      )}
                    </td>
                    <td className="align-middle">
                      {editWord?.id === word.id ? (
                        <>
                          <Form.Control
                            type="text"
                            value={editForm.translation}
                            onChange={(e) => setEditForm({...editForm, translation: e.target.value})}
                            isInvalid={!!errors.translation}
                          />
                          {errors.translation && (
                            <Form.Text className="text-danger">{errors.translation}</Form.Text>
                          )}
                        </>
                      ) : (
                        word.translation
                      )}
                    </td>
                    <td className="align-middle">
                      <div className="d-flex justify-content-center gap-2">
                        {editWord?.id === word.id ? (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={loading}
                            >
                              Сохранить
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={loading}
                            >
                              Отмена
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditWord(word)}
                              disabled={loading}
                              title="Редактировать"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteWord(word.id)}
                              disabled={loading}
                              title="Удалить"
                            >
                              <FaTrashAlt />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info" className="my-3">
              Ничего не найдено
            </Alert>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Закрыть
        </Button>
      </Modal.Footer>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Добавить новое слово</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Слово *</Form.Label>
            <Form.Control
              type="text"
              value={addForm.name}
              onChange={(e) => setAddForm({...addForm, name: e.target.value})}
              isInvalid={!!error && !addForm.name.trim()}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Перевод *</Form.Label>
            <Form.Control
              type="text"
              value={addForm.translation}
              onChange={(e) => setAddForm({...addForm, translation: e.target.value})}
              isInvalid={!!error && !addForm.translation.trim()}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Часть речи</Form.Label>
            <Form.Control
              type="text"
              value={partOfSpeech?.name}
              readOnly
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddWord} 
            disabled={loading}
          >
            {loading ? 'Добавление...' : 'Добавить'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default PartsOfSpeechManagement;