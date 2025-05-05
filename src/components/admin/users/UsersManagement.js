import React, { useState, useEffect, useCallback } from 'react';
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
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { 
  FaLock, 
  FaUnlock, 
  FaSearch,
  FaSyncAlt,
  FaUserShield,
  FaUserCheck,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaArrowLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import UserEditModal from './UserEditModal';
import UserDeleteModal from './UserDeleteModal';
import UserDetailsModal from './UserDetailsModal';
import '../users/UserAdmin.css';

const UsersManagement = ({ setError }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [localError, setLocalError] = useState(null);
  
  const [modalState, setModalState] = useState({
    showConfirm: false,
    showEdit: false,
    showDelete: false,
    showDetails: false,
    selectedUser: null,
    actionType: ''
  });

  const normalizeUsers = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.id) return [data];
    return [];
  };

  const fetchBlockedUsers = useCallback(async () => {
    try {
      const response = await fetch('https://localhost:7119/api/users/blocked');
      const text = await response.text();
      if (!response.ok) throw new Error('Ошибка загрузки заблокированных пользователей');
      const data = text ? JSON.parse(text) : [];
      setBlockedUsers(normalizeUsers(data));
    } catch (err) {
      console.error('Fetch blocked users error:', err);
      setLocalError(err.message);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://localhost:7119/api/users');
      const text = await response.text();
      if (!response.ok) throw new Error('Ошибка загрузки пользователей');
      const data = text ? JSON.parse(text) : [];
      const normalized = normalizeUsers(data);
      
      const usersWithBlockStatus = normalized.map(user => ({
        ...user,
        isBlocked: blockedUsers.some(bu => bu.id === user.id)
      }));
      
      setUsers(usersWithBlockStatus);
    } catch (err) {
      console.error('Fetch users error:', err);
      setLocalError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [blockedUsers]);

  const searchUsers = useCallback(async (query) => {
    try {
      setLoading(true);
      const response = await fetch(`https://localhost:7119/api/users/by-username?userName=${query}`);
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      const normalized = normalizeUsers(data);
      
      const usersWithBlockStatus = normalized.map(user => ({
        ...user,
        isBlocked: blockedUsers.some(bu => bu.id === user.id)
      }));
      
      setUsers(usersWithBlockStatus);
    } catch (err) {
      console.error('Search users error:', err);
      setLocalError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [blockedUsers]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  useEffect(() => { 
    if (searchTerm.length > 2) {
      searchUsers(searchTerm);
    } else {
      fetchUsers();
    }
  }, [searchTerm, fetchUsers, searchUsers]);

  const toggleBlockUser = async () => {
    try {
      const endpoint = modalState.actionType === 'block' 
        ? `https://localhost:7119/api/auth/block/${modalState.selectedUser.id}`
        : `https://localhost:7119/api/auth/unblock/${modalState.selectedUser.id}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!response.ok) throw new Error('Ошибка выполнения операции');
      
      await fetchBlockedUsers();
      await fetchUsers();
      
      setModalState(prev => ({ ...prev, showConfirm: false }));
    } catch (err) {
      console.error('Toggle block error:', err);
      setLocalError(err.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const userName = user.userName || '';
    const email = user.email || '';
    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleActionClick = (user, type) => {
    setModalState({
      showConfirm: type === 'block' || type === 'unblock',
      showEdit: type === 'edit',
      showDelete: type === 'delete',
      showDetails: type === 'view',
      selectedUser: user,
      actionType: type
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="users-management">
      <div className="back-navigation mb-4">
        <Button 
          variant="link" 
          onClick={() => navigate('/admin')}
          className="back-button text-decoration-none p-0"
        >
          <div className="d-flex align-items-center">
            <FaArrowLeft className="me-2" />
            <span>Вернуться в админ-панель</span>
          </div>
        </Button>
      </div>

      <div className="management-header">
        <h2 className="text-dark">
          <FaUserShield className="header-icon me-2" /> Управление пользователями
        </h2>
        
        <div className="search-refresh">
          <InputGroup className="search-bar">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Поиск по имени или email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Button 
            variant="light"
            onClick={() => {
              fetchBlockedUsers();
              fetchUsers();
            }}
            className="refresh-btn"
            title="Обновить данные"
          >
            <FaSyncAlt />
          </Button>
        </div>
      </div>

      {localError && (
        <Alert variant="danger" onClose={() => setLocalError(null)} dismissible>
          {localError}
        </Alert>
      )}

      <div className="table-responsive fixed-table-container">
        <Table striped hover className="users-table m-0">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>ID</th>
              <th>Пользователь</th>
              <th>Email</th>
              <th style={{ width: '140px' }}>Статус</th>
              <th style={{ width: '200px' }} className="text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id} className={user.isBlocked ? 'blocked-user' : ''}>
                <td className="align-middle">
                  <div className="user-id text-truncate" style={{ maxWidth: '110px' }}>
                    {user.id?.substring(0, 8)}...
                  </div>
                </td>
                <td className="align-middle">
                  <div className="user-info">
                    <div className="username">{user.userName || '-'}</div>
                    {user.firstName && user.lastName && (
                      <div className="fullname">{user.firstName} {user.lastName}</div>
                    )}
                  </div>
                </td>
                <td className="align-middle">
                  <div className="text-truncate" style={{ maxWidth: '200px' }}>
                    {user.email || '-'}
                  </div>
                </td>
                <td className="align-middle">
                  <Badge 
                    bg={user.isBlocked ? 'danger' : 'success'} 
                    className="status-badge"
                  >
                    {user.isBlocked ? <FaLock /> : <FaUserCheck />}
                    <span className="ms-1">
                      {user.isBlocked ? 'Заблок.' : 'Активен'}
                    </span>
                  </Badge>
                </td>
                <td className="align-middle">
                  <div className="d-flex justify-content-center action-buttons">
                    <OverlayTrigger overlay={<Tooltip>Просмотреть</Tooltip>}>
                      <Button
                        variant="outline-info"
                        onClick={() => handleActionClick(user, 'view')}
                        className="action-btn"
                      >
                        <FaEye />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>{user.isBlocked ? 'Разблокировать' : 'Заблокировать'}</Tooltip>}>
                      <Button
                        variant={user.isBlocked ? "outline-success" : "outline-warning"}
                        onClick={() => handleActionClick(user, user.isBlocked ? 'unblock' : 'block')}
                        className="action-btn"
                      >
                        {user.isBlocked ? <FaUnlock /> : <FaLock />}
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Редактировать</Tooltip>}>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleActionClick(user, 'edit')}
                        className="action-btn"
                      >
                        <FaEdit />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Удалить</Tooltip>}>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleActionClick(user, 'delete')}
                        className="action-btn"
                      >
                        <FaTrashAlt />
                      </Button>
                    </OverlayTrigger>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.Prev 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      <UserDetailsModal
        show={modalState.showDetails}
        user={modalState.selectedUser}
        onClose={() => setModalState(prev => ({ ...prev, showDetails: false }))}
      />

      <UserEditModal
        show={modalState.showEdit}
        user={modalState.selectedUser}
        onClose={() => setModalState(prev => ({ ...prev, showEdit: false }))}
        onSave={() => {
          fetchBlockedUsers();
          fetchUsers();
        }}
        setError={setLocalError}
      />

      <UserDeleteModal
        show={modalState.showDelete}
        user={modalState.selectedUser}
        onClose={() => setModalState(prev => ({ ...prev, showDelete: false }))}
        onDelete={() => {
          fetchBlockedUsers();
          fetchUsers();
        }}
        setError={setLocalError}
      />

      <Modal show={modalState.showConfirm} onHide={() => setModalState(prev => ({ ...prev, showConfirm: false }))} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalState.actionType === 'block' ? 'Блокировка пользователя' : 'Разблокировка пользователя'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Вы уверены, что хотите {modalState.actionType === 'block' ? 'заблокировать' : 'разблокировать'} пользователя 
            <strong> {modalState.selectedUser?.userName || 'Неизвестный пользователь'}</strong>?
          </p>
          {modalState.actionType === 'block' && (
            <Alert variant="warning">
              Пользователь не сможет войти в систему до разблокировки.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="btn btn-outline-dark" onClick={() => setModalState(prev => ({ ...prev, showConfirm: false }))}>
            Отмена
          </Button>
          <Button 
            variant={modalState.actionType === 'block' ? "btn btn-outline-danger" : "success"} 
            onClick={toggleBlockUser}
          >
            {modalState.actionType === 'block' ? 'Заблокировать' : 'Разблокировать'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsersManagement;