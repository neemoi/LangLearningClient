import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Table, Button, Spinner, Badge, Alert,
  InputGroup, FormControl, Card, Modal, Form
} from 'react-bootstrap';
import { 
  FaSearch, FaSyncAlt, FaPlus, FaEdit, FaTrashAlt, FaArrowLeft, FaEye, FaList 
} from 'react-icons/fa';
import API_CONFIG from '../../src/config';

const AlphabetLettersManagement = () => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showLetterModal, setShowLetterModal] = useState(false);
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [showWordsListModal, setShowWordsListModal] = useState(false);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [modalAction, setModalAction] = useState('add');

  const fetchLetters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter`);
      if (!response.ok) throw new Error('Ошибка загрузки букв');
      setLetters(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const handleAddLetter = () => {
    setCurrentLetter(null);
    setModalAction('add');
    setShowLetterModal(true);
  };

  const handleEditLetter = (letter) => {
    setCurrentLetter(letter);
    setModalAction('edit');
    setShowLetterModal(true);
  };

  const handleSaveLetter = async (letterData) => {
    try {
      const url = `${API_CONFIG.BASE_URL}/api/AlphabetLetter`;
      const method = modalAction === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(letterData)
      });

      if (!response.ok) throw new Error(`Ошибка ${modalAction === 'add' ? 'добавления' : 'обновления'} буквы`);
      
      await fetchLetters();
      setShowLetterModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteLetter = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту букву? Все связанные слова также будут удалены!')) return;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) throw new Error('Ошибка удаления буквы');
      await fetchLetters();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShowAddWord = (letter) => {
    setCurrentLetter(letter);
    setShowAddWordModal(true);
  };

  const handleShowWordsList = (letter) => {
    setCurrentLetter(letter);
    setShowWordsListModal(true);
  };

  const filteredLetters = letters.filter(letter => 
    letter.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="letters-management px-4 py-5">
      <LetterModal
        show={showLetterModal}
        letter={currentLetter}
        onHide={() => setShowLetterModal(false)}
        onSave={handleSaveLetter}
        action={modalAction}
        existingLetters={letters}
      />

      <AddWordModal 
        show={showAddWordModal}
        letter={currentLetter}
        onHide={() => setShowAddWordModal(false)}
        onRefresh={fetchLetters}
      />

      <WordsListModal
        show={showWordsListModal}
        letter={currentLetter}
        onHide={() => setShowWordsListModal(false)}
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
          <h1 className="h3 mb-0 fw-bold">Управление буквами алфавита</h1>
        </div>
        
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <InputGroup className="flex-grow-1" style={{ maxWidth: '500px' }}>
                <InputGroup.Text className="bg-white">
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Поиск по буквам"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>

              <div className="d-flex gap-3">
                <Button 
                  variant="light" 
                  onClick={fetchLetters}
                  className="px-3"
                >
                  <FaSyncAlt />
                </Button>
                
                <Button 
                  variant="primary" 
                  onClick={handleAddLetter}
                  className="d-flex align-items-center px-4"
                >
                  <FaPlus className="me-2" /> Добавить букву
                </Button>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
                Всего: {letters.length}
              </Badge>
              <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
                Найдено: {filteredLetters.length}
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
                  <th>Буква</th>
                  <th>Кол-во слов</th>
                  <th width="250" className="text-center pe-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredLetters.length > 0 ? (
                  filteredLetters.map(letter => (
                    <tr key={letter.id}>
                      <td className="align-middle ps-4">{letter.id}</td>
                      <td className="align-middle fw-bold">{letter.symbol}</td>
                      <td className="align-middle">
                        <Badge bg="info">{letter.words?.length || 0}</Badge>
                      </td>
                      <td className="align-middle pe-4">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleShowAddWord(letter)}
                            className="px-2 py-1"
                            title="Добавить слово"
                          >
                            <FaPlus />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowWordsList(letter)}
                            className="px-2 py-1"
                            title="Просмотреть слова"
                          >
                            <FaList />
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleEditLetter(letter)}
                            className="px-2 py-1"
                            title="Редактировать букву"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteLetter(letter.id)}
                            className="px-2 py-1"
                            title="Удалить букву"
                          >
                            <FaTrashAlt />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="text-muted mb-3">
                        {searchTerm ? 'Ничего не найдено' : 'Нет букв'}
                      </div>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={handleAddLetter}
                        className="px-3"
                      >
                        <FaPlus className="me-2" /> Добавить букву
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

const LetterModal = ({ show, letter, onHide, onSave, action, existingLetters }) => {
  const [formData, setFormData] = useState({
    id: 0,
    symbol: '',
    imageUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (letter) {
      setFormData({
        id: letter.id,
        symbol: letter.symbol,
        imageUrl: letter.imageUrl || ''
      });
    } else {
      setFormData({
        id: 0,
        symbol: '',
        imageUrl: ''
      });
    }
    setErrors({});
    setFormError('');
  }, [letter]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Буква обязательна';
    } else if (
      action === 'add' && 
      existingLetters.some(l => l.symbol.toLowerCase() === formData.symbol.toLowerCase())
    ) {
      newErrors.symbol = 'Такая буква уже существует';
    }
    
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'URL изображения обязателен';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Некорректный URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
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
      <Modal.Header closeButton>
        <Modal.Title>{action === 'add' ? 'Добавление буквы' : 'Редактирование буквы'}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          {formError && (
            <Alert variant="danger" dismissible onClose={() => setFormError('')}>
              {formError}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Буква *</Form.Label>
            <Form.Control
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({...formData, symbol: e.target.value})}
              isInvalid={!!errors.symbol}
              maxLength="1"
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.symbol}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>URL изображения *</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://example.com/image.png"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              isInvalid={!!errors.imageUrl}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.imageUrl}
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

const AddWordModal = ({ show, letter, onHide, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    alphabetLetterId: letter?.id || 0
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (letter) {
      setFormData(prev => ({ ...prev, alphabetLetterId: letter.id }));
    }
  }, [letter]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Слово обязательно';
    }
    
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'URL изображения обязателен';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Некорректный URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Ошибка добавления слова');
      
      setFormData({
        name: '',
        imageUrl: '',
        alphabetLetterId: letter.id
      });
      setErrors({});
      onRefresh();
      onHide();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Добавить слово для буквы "{letter?.symbol}"</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Слово *</Form.Label>
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
          
          <Form.Group className="mb-3">
            <Form.Label>URL изображения *</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://example.com/image.png"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              isInvalid={!!errors.imageUrl}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.imageUrl}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Добавление...' : 'Добавить слово'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

const WordsListModal = ({ show, letter, onHide }) => {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editWord, setEditWord] = useState(null);
    const [editForm, setEditForm] = useState({
      id: 0,
      name: '',
      imageUrl: ''
    });
    const [errors, setErrors] = useState({});
  
    useEffect(() => {
      if (show && letter) {
        fetchWords();
      }
    }, [show, letter]);
  
    const fetchWords = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter/letters/${letter.id}/words`);
        if (!response.ok) throw new Error('Ошибка загрузки слов');
        
        const data = await response.json();
        const wordsArray = Array.isArray(data) ? data : data ? [data] : [];
        setWords(wordsArray);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  const handleDeleteWord = async (wordId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это слово?')) return;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter/words/${wordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) throw new Error('Ошибка удаления слова');
      await fetchWords();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditWord = (word) => {
    setEditWord(word);
    setEditForm({
      id: word.id,
      name: word.name,
      imageUrl: word.imageUrl
    });
  };

  const handleCancelEdit = () => {
    setEditWord(null);
    setEditForm({
      id: 0,
      name: '',
      imageUrl: ''
    });
    setErrors({});
  };

  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editForm.name.trim()) {
      newErrors.name = 'Слово обязательно';
    }
    
    if (!editForm.imageUrl.trim()) {
      newErrors.imageUrl = 'URL изображения обязателен';
    } else if (!isValidUrl(editForm.imageUrl)) {
      newErrors.imageUrl = 'Некорректный URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSaveEdit = async () => {
    if (!validateEditForm()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/AlphabetLetter/words`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          ...editForm,
          alphabetLetterId: letter.id
        })
      });

      if (!response.ok) throw new Error('Ошибка обновления слова');
      
      await fetchWords();
      handleCancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Слова для буквы "{letter?.symbol}"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading && !editWord ? (
          <div className="text-center py-3">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : words.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Слово</th>
                <th>Изображение</th>
                <th width="150">Действия</th>
              </tr>
            </thead>
            <tbody>
              {words.map(word => (
                <tr key={word.id}>
                  <td>
                    {editWord?.id === word.id ? (
                      <Form.Control
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        isInvalid={!!errors.name}
                      />
                    ) : (
                      word.name
                    )}
                  </td>
                  <td>
                    {editWord?.id === word.id ? (
                      <Form.Control
                        type="url"
                        value={editForm.imageUrl}
                        onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})}
                        isInvalid={!!errors.imageUrl}
                      />
                    ) : word.imageUrl ? (
                      <a href={word.imageUrl} target="_blank" rel="noopener noreferrer">
                        <FaEye className="me-1" /> Просмотреть
                      </a>
                    ) : 'Нет изображения'}
                  </td>
                  <td className="text-center">
                    {editWord?.id === word.id ? (
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          variant="outline-success"
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
                      </div>
                    ) : (
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditWord(word)}
                          title="Редактировать"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteWord(word.id)}
                          title="Удалить"
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Alert variant="info">
            Нет слов для этой буквы
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Закрыть
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AlphabetLettersManagement;