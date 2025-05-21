import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, Button, Spinner, Badge, Alert,
  InputGroup, FormControl, Pagination,
  Modal, Card, Container, Form, Tabs, Tab
} from 'react-bootstrap';
import { 
  FaSearch, FaSyncAlt, FaEye, FaEdit, 
  FaTrashAlt, FaPlus, FaArrowLeft,
  FaMale, FaFemale
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import MaleNamesModal from './MaleNamesModal';
import FemaleNamesModal from './FemaleNamesModal';
import NameDetailsModal from './NameDetailsModal';
import API_CONFIG from './../../src/config';
import './NamesManagement.css';

const NamesManagement = () => {
  const navigate = useNavigate();
  const [names, setNames] = useState([]);
  const [maleNames, setMaleNames] = useState([]);
  const [femaleNames, setFemaleNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('names');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [namesPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [modalState, setModalState] = useState({
    showEdit: false,
    showDelete: false,
    showDetails: false,
    showMaleNames: false,
    showFemaleNames: false,
    selectedName: null,
    selectedGenderName: { englishNameId: '', name: '' },
    editingGenderName: null,
    genderType: null
  });

  const API_URLS = {
    names: `${API_CONFIG.BASE_URL}/api/Name/englishnames`,
    maleNames: `${API_CONFIG.BASE_URL}/api/MaleName`,
    femaleNames: `${API_CONFIG.BASE_URL}/api/FemaleName`
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [namesRes, maleRes, femaleRes] = await Promise.all([
        fetch(API_URLS.names),
        fetch(API_URLS.maleNames),
        fetch(API_URLS.femaleNames)
      ]);

      if (!namesRes.ok) throw new Error('Ошибка загрузки имен');
      if (!maleRes.ok) throw new Error('Ошибка загрузки мужских имен');
      if (!femaleRes.ok) throw new Error('Ошибка загрузки женских имен');

      const [namesData, maleData, femaleData] = await Promise.all([
        namesRes.json(),
        maleRes.json(),
        femaleRes.json()
      ]);

      setNames(namesData);
      setMaleNames(maleData);
      setFemaleNames(femaleData);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = modalState.selectedName?.id ? 'PUT' : 'POST';
      const url = modalState.selectedName?.id 
        ? `${API_URLS.names}/${modalState.selectedName.id}`
        : API_URLS.names;
      
      const dataToSend = {
        id: modalState.selectedName?.id || 0,
        name: modalState.selectedName?.name || '',
        imagePath: modalState.selectedName?.imagePath || ''
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка сохранения имени');
      }

      setSuccess(modalState.selectedName?.id ? 'Имя обновлено' : 'Имя добавлено');
      fetchData();
      setModalState(prev => ({ ...prev, showEdit: false }));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError(err.message);
    }
  };

  const handleGenderNameSubmit = async (e, type) => {
    e.preventDefault();
    try {
      const url = API_URLS[`${type}Names`];
      const method = modalState.editingGenderName ? 'PUT' : 'POST';
      
      const dataToSend = {
        id: modalState.selectedGenderName.id || 0,
        englishNameId: Number(modalState.selectedGenderName.englishNameId),
        name: modalState.selectedGenderName.name
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) throw new Error('Ошибка сохранения');

      setSuccess(modalState.editingGenderName 
        ? `${type === 'male' ? 'Мужское' : 'Женское'} имя обновлено`
        : `${type === 'male' ? 'Мужское' : 'Женское'} имя добавлено`);
      
      fetchData();
      setModalState(prev => ({ 
        ...prev, 
        [`show${type.charAt(0).toUpperCase() + type.slice(1)}Names`]: false,
        editingGenderName: null 
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URLS.names}/${modalState.selectedName.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Ошибка удаления');

      setSuccess('Имя удалено');
      fetchData();
      setModalState(prev => ({ ...prev, showDelete: false }));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Ошибка удаления:', err);
      setError(err.message);
    }
  };

  const handleDeleteGenderName = async (id, type) => {
    if (window.confirm(`Удалить ${type === 'male' ? 'мужское' : 'женское'} имя?`)) {
      try {
        const response = await fetch(`${API_URLS[`${type}Names`]}/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Ошибка удаления');

        setSuccess(`${type === 'male' ? 'Мужское' : 'Женское'} имя удалено`);
        fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalState(prev => ({
      ...prev,
      selectedName: {
        ...prev.selectedName,
        [name]: value
      }
    }));
  };

  const handleGenderNameInputChange = (e) => {
    const { name, value } = e.target;
    setModalState(prev => ({
      ...prev,
      selectedGenderName: {
        ...prev.selectedGenderName,
        [name]: value
      }
    }));
  };

  const handleActionClick = (name, action) => {
    if (action === 'view' && !name) {
      setError('Ошибка загрузки данных имени');
      return;
    }
    
    setModalState({
      ...modalState,
      showEdit: action === 'edit',
      showDelete: action === 'delete',
      showDetails: action === 'view',
      selectedName: name
    });
  };

  const handleEditGenderName = (name, type) => {
    setModalState({
      ...modalState,
      [`show${type.charAt(0).toUpperCase() + type.slice(1)}Names`]: true,
      selectedGenderName: name,
      editingGenderName: name,
      genderType: type
    });
  };

  const handleAddNew = () => {
    if (activeTab === 'names') {
      setModalState({
        ...modalState,
        showEdit: true,
        selectedName: { id: 0, name: '', imagePath: '' }
      });
    } else {
      const type = activeTab;
      setModalState({
        ...modalState,
        [`show${type.charAt(0).toUpperCase() + type.slice(1)}Names`]: true,
        selectedGenderName: { englishNameId: '', name: '' },
        editingGenderName: null,
        genderType: type
      });
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'male': return 'мужское имя';
      case 'female': return 'женское имя';
      default: return 'имя';
    }
  };

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    switch (activeTab) {
      case 'male':
        return maleNames.filter(item => 
          item.name.toLowerCase().includes(term) ||
          names.find(n => n.id === item.englishNameId)?.name.toLowerCase().includes(term)
        );
      case 'female':
        return femaleNames.filter(item => 
          item.name.toLowerCase().includes(term) ||
          names.find(n => n.id === item.englishNameId)?.name.toLowerCase().includes(term)
        );
      default:
        return names.filter(item => 
          item.name.toLowerCase().includes(term) ||
          (item.imagePath && item.imagePath.toLowerCase().includes(term))
        );
    }
  }, [names, maleNames, femaleNames, searchTerm, activeTab]);

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * namesPerPage;
    const indexOfFirstItem = indexOfLastItem - namesPerPage;
    return filteredData.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredData, currentPage, namesPerPage]);

  const totalPages = Math.ceil(filteredData.length / namesPerPage);

  const getEnglishName = (id) => {
    return names.find(name => name.id === id)?.name || 'Не указано';
  };

  if (loading && names.length === 0) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="names-management px-4 py-5">
      <div className="mb-5">
        <div className="d-flex align-items-center mb-4">
          <Button variant="link" onClick={() => navigate(-1)} className="text-muted p-0 d-flex align-items-center me-4">
            <FaArrowLeft className="me-2" />
            <span className="fw-medium">Назад</span>
          </Button>
          <h1 className="h3 mb-0 fw-bold">Управление именами</h1>
        </div>
        
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
              <Tab eventKey="names" title="Английские имена" />
              <Tab eventKey="male" title={<><FaMale className="me-1" /> Мужские</>} />
              <Tab eventKey="female" title={<><FaFemale className="me-1" /> Женские</>} />
            </Tabs>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <InputGroup className="flex-grow-1" style={{ maxWidth: '500px' }}>
                <InputGroup.Text className="bg-white">
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <FormControl
                  placeholder={`Поиск по ${activeTab === 'names' ? 'имени или пути к изображению' : activeTab === 'male' ? 'мужскому имени' : 'женскому имени'}`}
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchTerm && (
                  <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                    Очистить
                  </Button>
                )}
              </InputGroup>

              <div className="d-flex gap-3">
                <Button variant="light" onClick={handleRefresh} className="px-3">
                  <FaSyncAlt />
                </Button>
                <Button variant="primary" onClick={handleAddNew} className="d-flex align-items-center px-4">
                  <FaPlus className="me-2" /> Добавить {getAddButtonText()}
                </Button>
              </div>
            </div>

            <div className="d-flex gap-2 mb-3">
              <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
                Всего: {filteredData.length}
              </Badge>
              {filteredData.length !== (activeTab === 'names' ? names.length : activeTab === 'male' ? maleNames.length : femaleNames.length) && (
                <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
                  Найдено: {filteredData.length}
                </Badge>
              )}
            </div>

            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  {activeTab === 'names' ? (
                    <tr>
                      <th width="80" className="ps-4">ID</th>
                      <th>Имя</th>
                      <th>Путь к изображению</th>
                      <th width="150" className="text-center pe-4">Действия</th>
                    </tr>
                  ) : (
                    <tr>
                      <th width="80" className="ps-4">ID</th>
                      <th>{activeTab === 'male' ? 'Мужское' : 'Женское'} имя</th>
                      <th>Английское имя</th>
                      <th width="150" className="text-center pe-4">Действия</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map(item => (
                      <tr key={item.id}>
                        <td className="align-middle ps-4">{item.id}</td>
                        <td className="align-middle fw-bold">{item.name}</td>
                        <td className="align-middle">
                          {activeTab === 'names' ? (
                            <div className="text-truncate" style={{ maxWidth: '300px' }}>
                              {item.imagePath || 'Не указано'}
                            </div>
                          ) : (
                            getEnglishName(item.englishNameId)
                          )}
                        </td>
                        <td className="align-middle pe-4">
                          <div className="d-flex justify-content-center gap-2">
                            {activeTab === 'names' ? (
                              <>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleActionClick(item, 'view')}
                                  className="px-2 py-1"
                                >
                                  <FaEye />
                                </Button>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleActionClick(item, 'edit')}
                                  className="px-2 py-1"
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleActionClick(item, 'delete')}
                                  className="px-2 py-1"
                                >
                                  <FaTrashAlt />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleEditGenderName(item, activeTab)}
                                  className="px-2 py-1"
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteGenderName(item.id, activeTab)}
                                  className="px-2 py-1"
                                >
                                  <FaTrashAlt />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-5">
                        <div className="text-muted mb-3">
                          {searchTerm ? 'Ничего не найдено' : 'Нет данных'}
                        </div>
                        <Button variant="outline-primary" size="sm" onClick={handleAddNew} className="px-3">
                          <FaPlus className="me-2" /> Добавить {getAddButtonText()}
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
                  Показано {(currentPage - 1) * namesPerPage + 1}-{Math.min(currentPage * namesPerPage, filteredData.length)} из {filteredData.length}
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
          </Card.Body>
        </Card>

        {(error || success) && (
          <Alert 
            variant={error ? 'danger' : 'success'} 
            dismissible 
            onClose={() => error ? setError(null) : setSuccess(null)}
            className="mb-4"
          >
            {error || success}
          </Alert>
        )}
      </div>

      <Modal show={modalState.showEdit} onHide={() => setModalState(prev => ({ ...prev, showEdit: false }))}>
        <Modal.Header closeButton>
          <Modal.Title>{modalState.selectedName?.id ? 'Редактировать имя' : 'Добавить имя'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>ID</Form.Label>
              <Form.Control
                type="text"
                value={modalState.selectedName?.id || 'Новый'}
                readOnly
                plaintext
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Имя *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={modalState.selectedName?.name || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Путь к изображению</Form.Label>
              <Form.Control
                type="text"
                name="imagePath"
                value={modalState.selectedName?.imagePath || ''}
                onChange={handleInputChange}
                placeholder="Необязательно"
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setModalState(prev => ({ ...prev, showEdit: false }))}>
                Отмена
              </Button>
              <Button variant="primary" type="submit">
                {modalState.selectedName?.id ? 'Обновить' : 'Добавить'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={modalState.showDelete} onHide={() => setModalState(prev => ({ ...prev, showDelete: false }))}>
        <Modal.Header closeButton>
          <Modal.Title>Удалить имя</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите удалить имя <strong>{modalState.selectedName?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalState(prev => ({ ...prev, showDelete: false }))}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>

      <NameDetailsModal
        show={modalState.showDetails}
        handleClose={() => setModalState(prev => ({ ...prev, showDetails: false }))}
        name={modalState.selectedName}
        maleNames={maleNames}
        femaleNames={femaleNames}
        onAddMaleName={() => setModalState(prev => ({ 
          ...prev, 
          showMaleNames: true, 
          showDetails: false,
          selectedGenderName: { englishNameId: modalState.selectedName?.id || '', name: '' },
          editingGenderName: null,
          genderType: 'male'
        }))}
        onAddFemaleName={() => setModalState(prev => ({ 
          ...prev, 
          showFemaleNames: true, 
          showDetails: false,
          selectedGenderName: { englishNameId: modalState.selectedName?.id || '', name: '' },
          editingGenderName: null,
          genderType: 'female'
        }))}
        onEditName={() => handleActionClick(modalState.selectedName, 'edit')}
        onDeleteGenderName={handleDeleteGenderName}
        onEditGenderName={handleEditGenderName}
      />

      <MaleNamesModal
        show={modalState.showMaleNames && modalState.genderType === 'male'}
        handleClose={() => setModalState(prev => ({ ...prev, showMaleNames: false }))}
        handleSubmit={(e) => handleGenderNameSubmit(e, 'male')}
        englishNames={names}
        selectedGenderName={modalState.selectedGenderName}
        handleInputChange={handleGenderNameInputChange}
        error={error}
        setError={setError}
        isEditing={!!modalState.editingGenderName}
      />

      <FemaleNamesModal
        show={modalState.showFemaleNames && modalState.genderType === 'female'}
        handleClose={() => setModalState(prev => ({ ...prev, showFemaleNames: false }))}
        handleSubmit={(e) => handleGenderNameSubmit(e, 'female')}
        englishNames={names}
        selectedGenderName={modalState.selectedGenderName}
        handleInputChange={handleGenderNameInputChange}
        error={error}
        setError={setError}
        isEditing={!!modalState.editingGenderName}
      />
    </Container>
  );
};

export default NamesManagement;