import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Spinner, 
  Badge, 
  Alert,
  InputGroup, 
  FormControl,
  Pagination,
  Modal,
  Card,
  Container
} from 'react-bootstrap';
import { 
  FaLock, 
  FaUnlock, 
  FaSearch,
  FaSyncAlt,
  FaUserCheck,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaArrowLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import UserEditModal from './UserEditModal';
import UserDeleteModal from './UserDeleteModal';
import UserDetailsModal from './UserDetailsModal';
import RegisterModal from '../../auth/RegisterModal/RegisterModal';
import API_CONFIG from '../../src/config';
import './UserAdmin.css';

const UsersManagement = ({ error = '', setError = () => {} }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [localError, setLocalError] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  
  const [modalState, setModalState] = useState({
    showConfirm: false,
    showEdit: false,
    showDelete: false,
    showDetails: false,
    showRegister: false,
    selectedUser: null,
    actionType: ''
  });

  const safeFetch = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error(`Fetch error for ${url}:`, error);
      throw error;
    }
  };

  const fetchUsersWithBlockStatus = useCallback(async () => {
    try {
      setLoading(true);
      setLocalError(null);
      
      const [usersData, blockedUsers] = await Promise.all([
        safeFetch(`${API_CONFIG.BASE_URL}/api/users`).catch(() => []),
        safeFetch(`${API_CONFIG.BASE_URL}/api/users/blocked`).catch(() => [])
      ]);

      const blockedIds = new Set((blockedUsers || []).map(user => user.id));
      
      const mergedUsers = Array.isArray(usersData) 
        ? usersData.map(user => ({
            ...user,
            isBlocked: blockedIds.has(user.id)
          }))
        : [];
      
      setUsers(mergedUsers);
    } catch (err) {
      console.error('Fetch users error:', err);
      setLocalError(err.message || 'Ошибка загрузки пользователей');
      setUsers([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const searchUsers = useCallback(async (query) => {
    try {
      setLoading(true);
      
      let result = null;
      try {
        if (query.includes('@')) {
          result = await safeFetch(`${API_CONFIG.BASE_URL}/api/users/by-email?email=${encodeURIComponent(query)}`);
        } else {
          result = await safeFetch(`${API_CONFIG.BASE_URL}/api/users/by-username?userName=${encodeURIComponent(query)}`);
        }
      } catch (searchError) {
        console.error('Search error:', searchError);
      }

      if (result) {
        try {
          const blockedUsers = await safeFetch(`${API_CONFIG.BASE_URL}/api/users/blocked`).catch(() => []);
          const isBlocked = (blockedUsers || []).some(u => u.id === result.id);
          setUsers([{ ...result, isBlocked }]);
        } catch (blockedErr) {
          console.error('Blocked status check error:', blockedErr);
          setUsers([result]);
        }
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Search users error:', err);
      setLocalError(err.message || 'Ошибка поиска пользователей');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        searchUsers(searchTerm);
      } else {
        fetchUsersWithBlockStatus();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchUsersWithBlockStatus, searchUsers]);

  const toggleBlockUser = async () => {
    try {
      const endpoint = modalState.actionType === 'block' 
        ? `${API_CONFIG.BASE_URL}/api/auth/block/${modalState.selectedUser.id}`
        : `${API_CONFIG.BASE_URL}/api/auth/unblock/${modalState.selectedUser.id}`;

      const updatedUser = await safeFetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (updatedUser) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === updatedUser.id ? { ...user, isBlocked: updatedUser.isBlocked } : user
          )
        );
      } else {
        await fetchUsersWithBlockStatus();
      }

      setModalState(prev => ({ ...prev, showConfirm: false }));
    } catch (err) {
      console.error('Toggle block error:', err);
      setLocalError(err.message || 'Ошибка при изменении статуса блокировки');
      await fetchUsersWithBlockStatus();
    }
  };

  const { filteredUsers, currentUsers, totalPages } = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => {
      const fields = [
        user.userName || '',
        user.email || '',
        user.firstName || '',
        user.lastName || ''
      ];
      return fields.some(field => field.toLowerCase().includes(term));
    });
    
    const indexOfLast = currentPage * usersPerPage;
    const indexOfFirst = indexOfLast - usersPerPage;
    
    return {
      filteredUsers: filtered,
      currentUsers: filtered.slice(indexOfFirst, indexOfLast),
      totalPages: Math.ceil(filtered.length / usersPerPage)
    };
  }, [users, searchTerm, currentPage, usersPerPage]);

  const handleActionClick = (user, type) => {
    setModalState({
      showConfirm: type === 'block' || type === 'unblock',
      showEdit: type === 'edit',
      showDelete: type === 'delete',
      showDetails: type === 'view',
      showRegister: type === 'register',
      selectedUser: user,
      actionType: type
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsersWithBlockStatus();
  };

  const handleRegisterSuccess = async () => {
    try {
      setModalState(prev => ({ ...prev, showRegister: false }));
      await fetchUsersWithBlockStatus();
      setSearchTerm('');
      setCurrentPage(1);
    } catch (err) {
      console.error('Error after registration:', err);
      setLocalError('Ошибка при обновлении списка пользователей');
    }
  };

  if (loading && users.length === 0) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="users-management px-4 py-5">
      <Modal 
        show={modalState.showConfirm} 
        onHide={() => setModalState(prev => ({ ...prev, showConfirm: false }))} 
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            {modalState.actionType === 'block' ? 'Блокировка пользователя' : 'Разблокировка пользователя'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Вы уверены, что хотите {modalState.actionType === 'block' ? 'заблокировать' : 'разблокировать'} пользователя 
            <strong> {modalState.selectedUser?.userName || 'Неизвестный пользователь'}</strong>?
          </p>
          {modalState.actionType === 'block' && (
            <Alert variant="warning" className="mb-0">
              Пользователь не сможет войти в систему до разблокировки.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setModalState(prev => ({ ...prev, showConfirm: false }))}
          >
            Отмена
          </Button>
          <Button 
            variant={modalState.actionType === 'block' ? "danger" : "success"} 
            onClick={toggleBlockUser}
            className="px-4"
          >
            {modalState.actionType === 'block' ? 'Заблокировать' : 'Разблокировать'}
          </Button>
        </Modal.Footer>
      </Modal>

      <UserDetailsModal
        show={modalState.showDetails}
        user={modalState.selectedUser}
        onClose={() => setModalState(prev => ({ ...prev, showDetails: false }))}
      />

      <UserEditModal
        show={modalState.showEdit}
        user={modalState.selectedUser}
        onClose={() => setModalState(prev => ({ ...prev, showEdit: false }))}
        onSave={fetchUsersWithBlockStatus}
        setError={setLocalError}
      />

      <UserDeleteModal
        show={modalState.showDelete}
        user={modalState.selectedUser}
        onClose={() => setModalState(prev => ({ ...prev, showDelete: false }))}
        onDelete={fetchUsersWithBlockStatus}
        setError={setLocalError}
      />

      <RegisterModal
        show={modalState.showRegister}
        onHide={() => setModalState(prev => ({ ...prev, showRegister: false }))}
        onRegisterSuccess={handleRegisterSuccess}
        setError={setLocalError}
        currentUser={currentUser}
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
          <h1 className="h3 mb-0 fw-bold">Управление пользователями</h1>
        </div>
        
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <InputGroup className="flex-grow-1" style={{ maxWidth: '500px' }}>
                <InputGroup.Text className="bg-white">
                  <FaSearch className="text-muted" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Поиск по имени, email или логину"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      setSearchTerm('');
                      fetchUsersWithBlockStatus();
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
                
                {currentUser?.role === 'Admin' && (
                  <Button 
                    variant="primary" 
                    onClick={() => handleActionClick(null, 'register')}
                    className="d-flex align-items-center px-4"
                  >
                    <FaPlus className="me-2" /> Добавить
                  </Button>
                )}
              </div>
            </div>

            <div className="d-flex gap-2">
              <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
                Всего: {users.length}
              </Badge>
              <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
                Найдено: {filteredUsers.length}
              </Badge>
              <Button 
                variant="outline-info" 
                size="sm" 
                onClick={async () => {
                  try {
                    setLoading(true);
                    const blockedUsers = await safeFetch(`${API_CONFIG.BASE_URL}/api/users/blocked`);
                    setUsers((blockedUsers || []).map(user => ({ ...user, isBlocked: true })));
                    setSearchTerm('');
                  } catch (err) {
                    console.error('Failed to load blocked users:', err);
                    setLocalError(err.message);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Показать заблокированных
              </Button>
            </div>
          </Card.Body>
        </Card>

        {(error || localError) && (
          <Alert variant="danger" dismissible onClose={() => {
            setError('');
            setLocalError(null);
          }} className="mb-4">
            {error || localError}
          </Alert>
        )}

        <Card className="border-0 shadow-sm">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th width="120" className="ps-4">ID</th>
                  <th>Пользователь</th>
                  <th>Email</th>
                  <th width="140">Статус</th>
                  <th width="200" className="text-center pe-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map(user => (
                    <tr key={user.id} className={user.isBlocked ? 'bg-light blocked-user' : ''}>
                      <td className="align-middle ps-4">
                        <div className="user-id text-truncate" style={{ maxWidth: '110px' }}>
                          {user.id?.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="user-info">
                          <div className="fw-bold username">{user.userName}</div>
                          {(user.firstName || user.lastName) && (
                            <div className="text-muted small fullname">
                              {user.firstName} {user.lastName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                          {user.email}
                        </div>
                      </td>
                      <td className="align-middle">
                        <Badge 
                          bg={user.isBlocked ? 'danger' : 'success'} 
                          className="d-flex align-items-center justify-content-center gap-1 py-2"
                          style={{ width: '90px' }}
                        >
                          {user.isBlocked ? <FaLock size={12} /> : <FaUserCheck size={12} />}
                          <span>{user.isBlocked ? 'Заблок.' : 'Активен'}</span>
                        </Badge>
                      </td>
                      <td className="align-middle pe-4">
                        <div className="d-flex justify-content-center gap-2 action-buttons">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleActionClick(user, 'view')}
                            className="px-2 py-1 action-btn"
                          >
                            <FaEye />
                          </Button>
                          
                          {currentUser?.role === 'Admin' && (
                            <>
                              <Button
                                variant={user.isBlocked ? "outline-success" : "outline-warning"}
                                size="sm"
                                onClick={() => handleActionClick(user, user.isBlocked ? 'unblock' : 'block')}
                                className="px-2 py-1 action-btn"
                              >
                                {user.isBlocked ? <FaUnlock /> : <FaLock />}
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleActionClick(user, 'edit')}
                                className="px-2 py-1 action-btn"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleActionClick(user, 'delete')}
                                className="px-2 py-1 action-btn"
                                disabled={user.id === currentUser?.id}
                                title={user.id === currentUser?.id ? 'Нельзя удалить себя' : ''}
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
                    <td colSpan="5" className="text-center py-5">
                      <div className="text-muted mb-3">
                        {searchTerm ? 'Ничего не найдено по вашему запросу' : 'Нет пользователей'}
                      </div>
                      {currentUser?.role === 'Admin' && (
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleActionClick(null, 'register')}
                          className="px-3"
                        >
                          <FaPlus className="me-2" /> Добавить пользователя
                        </Button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top">
              <div className="text-muted small mb-2 mb-md-0">
                Показано {(currentPage - 1) * usersPerPage + 1}-{Math.min(currentPage * usersPerPage, filteredUsers.length)} из {filteredUsers.length}
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

export default UsersManagement;