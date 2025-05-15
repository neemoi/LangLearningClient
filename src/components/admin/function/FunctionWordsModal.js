import React, { useState, useEffect } from 'react';
import { 
  Modal, Button, Table, Form, Alert, Spinner, 
  Badge, InputGroup, FloatingLabel, Stack 
} from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaPlus, FaSyncAlt, FaTimes } from 'react-icons/fa';
import API_CONFIG from '../../src/config';
import './FunctionManagement.css';

const FunctionWordsModal = ({ show, partOfSpeech, onHide }) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editWord, setEditWord] = useState(null);
  const [editForm, setEditForm] = useState({
    id: 0,
    word: '',
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
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/Language/function-word?partOfSpeechId=${partOfSpeech.id}`);
      if (!response.ok) throw new Error('Ошибка загрузки слов');
      
      const data = await response.json();
      const validatedWords = Array.isArray(data) 
        ? data.map(word => ({
            id: word.id || 0,
            name: word.name || '',
            translation: word.translation || '',
            partOfSpeechId: word.partOfSpeechId || 0
          }))
        : [];
      
      setWords(validatedWords);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredWords = words.filter(word => 
    word.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    word.translation.toLowerCase().includes(searchTerm.toLowerCase())
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
      word: word.name,
      translation: word.translation
    });
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditWord(null);
    setEditForm({
      id: 0,
      word: '',
      translation: ''
    });
    setErrors({});
  };

  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editForm.word.trim()) newErrors.word = 'Слово обязательно';
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
          name: editForm.word,
          translation: editForm.translation,
          partOfSpeechId: partOfSpeech.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления слова');
      }
      
      await fetchWords();
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
        body: JSON.stringify(addForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка добавления слова');
      }
      
      await fetchWords();
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
    <Modal show={show} onHide={onHide} size="xl" centered className="words-modal" backdrop="static">
      <Modal.Header className="bg-light border-bottom-0 pb-0">
        <Modal.Title className="fw-bold">
          <span className="text-primary">{partOfSpeech?.name}</span> - Функциональные слова
        </Modal.Title>
        <Button variant="link" onClick={onHide} className="p-0">
          <FaTimes className="text-muted" />
        </Button>
      </Modal.Header>
      
      <Modal.Body className="pt-0">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
            {error}
          </Alert>
        )}

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <InputGroup className="flex-grow-1" style={{ maxWidth: '400px' }}>
            <InputGroup.Text className="bg-white">
              <FaSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Поиск по словам или переводам"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-start-0"
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearchTerm('')}
              >
                Очистить
              </Button>
            )}
          </InputGroup>

          <Stack direction="horizontal" gap={2}>
            <Button 
              variant="light" 
              onClick={fetchWords}
              disabled={loading}
              className="px-3"
            >
              <FaSyncAlt className={loading ? "spin" : ""} />
            </Button>
            
            <Button 
              variant="primary" 
              onClick={() => setShowAddModal(true)}
              className="d-flex align-items-center px-4"
              disabled={loading}
            >
              <FaPlus className="me-2" /> Добавить слово
            </Button>
          </Stack>
        </div>

        <div className="d-flex gap-2 mb-3">
          <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
            Всего: {words.length}
          </Badge>
          <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
            Найдено: {filteredWords.length}
          </Badge>
        </div>

        <div className="border rounded-3 overflow-hidden">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2">Загрузка слов...</div>
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
                        <Form.Group>
                          <Form.Control
                            type="text"
                            value={editForm.word}
                            onChange={(e) => setEditForm({...editForm, word: e.target.value})}
                            isInvalid={!!errors.word}
                            placeholder="Введите слово"
                          />
                          {errors.word && (
                            <Form.Text className="text-danger">{errors.word}</Form.Text>
                          )}
                        </Form.Group>
                      ) : (
                        word.name
                      )}
                    </td>
                    <td className="align-middle">
                      {editWord?.id === word.id ? (
                        <Form.Group>
                          <Form.Control
                            type="text"
                            value={editForm.translation}
                            onChange={(e) => setEditForm({...editForm, translation: e.target.value})}
                            isInvalid={!!errors.translation}
                            placeholder="Введите перевод"
                          />
                          {errors.translation && (
                            <Form.Text className="text-danger">{errors.translation}</Form.Text>
                          )}
                        </Form.Group>
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
                              className="px-3"
                            >
                              {loading ? (
                                <Spinner as="span" animation="border" size="sm" />
                              ) : 'Сохранить'}
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={loading}
                              className="px-3"
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
                              className="px-3"
                              title="Редактировать"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteWord(word.id)}
                              disabled={loading}
                              className="px-3"
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
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                {searchTerm ? 'Ничего не найдено' : 'Нет слов для этой части речи'}
              </div>
              <Button 
                variant="outline-primary" 
                onClick={() => setShowAddModal(true)}
                className="px-4"
                disabled={loading}
              >
                <FaPlus className="me-2" /> Добавить слово
              </Button>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Добавить новое слово</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-4">
            <FloatingLabel controlId="addWord" label="Слово *">
              <Form.Control
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                placeholder=" "
                isInvalid={!!error && !addForm.name.trim()}
              />
            </FloatingLabel>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <FloatingLabel controlId="addTranslation" label="Перевод *">
              <Form.Control
                type="text"
                value={addForm.translation}
                onChange={(e) => setAddForm({...addForm, translation: e.target.value})}
                placeholder=" "
                isInvalid={!!error && !addForm.translation.trim()}
              />
            </FloatingLabel>
          </Form.Group>
          
          <Form.Group>
            <FloatingLabel controlId="addPartOfSpeech" label="Часть речи">
              <Form.Control
                type="text"
                value={partOfSpeech?.name}
                readOnly
                placeholder=" "
              />
            </FloatingLabel>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddWord} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Добавление...
              </>
            ) : 'Добавить слово'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default FunctionWordsModal;