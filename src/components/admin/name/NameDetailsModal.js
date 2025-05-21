import React from 'react';
import { Modal, Button, Table, Badge, Alert } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaPlus, FaMale, FaFemale } from 'react-icons/fa';

const NameDetailsModal = ({
  show,
  handleClose,
  name,
  maleNames = [],
  femaleNames = [],
  onAddMaleName,
  onAddFemaleName,
  onEditName,
  onDeleteGenderName,
  onEditGenderName
}) => {
  if (!name) {
    return (
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ошибка</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">Не удалось загрузить данные имени</Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const getGenderNames = (type) => {
    return type === 'male' 
      ? maleNames.filter(m => m.englishNameId === name.id)
      : femaleNames.filter(f => f.englishNameId === name.id);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Детали имени: {name.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <h5>Основная информация</h5>
          <div className="row mb-3">
            <div className="col-md-6">
              <p><strong>ID:</strong> {name.id}</p>
              <p><strong>Имя:</strong> {name.name}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Путь к изображению:</strong> {name.imagePath || 'Не указан'}</p>
            </div>
          </div>
          {name.imagePath && (
            <div className="text-center mt-3">
              <img 
                src={name.imagePath} 
                alt={name.name} 
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              />
            </div>
          )}
        </div>

        <GenderNamesSection 
          type="male"
          icon={<FaMale />}
          names={getGenderNames('male')}
          onAdd={onAddMaleName}
          onDelete={onDeleteGenderName}
          onEdit={onEditGenderName}
        />

        <GenderNamesSection 
          type="female"
          icon={<FaFemale />}
          names={getGenderNames('female')}
          onAdd={onAddFemaleName}
          onDelete={onDeleteGenderName}
          onEdit={onEditGenderName}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Закрыть
        </Button>
        <Button variant="primary" onClick={onEditName}>
          Редактировать имя
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const GenderNamesSection = ({ type, icon, names, onAdd, onDelete, onEdit }) => (
  <div className="mb-4">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5>
        {icon} {type === 'male' ? 'Мужские' : 'Женские'} имена
      </h5>
      <Button variant="primary" size="sm" onClick={onAdd}>
        <FaPlus className="me-1" /> Добавить {type === 'male' ? 'мужское' : 'женское'} имя
      </Button>
    </div>
    
    {names.length > 0 ? (
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {names.map(name => (
              <tr key={name.id}>
                <td>{name.id}</td>
                <td>{name.name}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => onEdit(name, type)}>
                      <FaEdit />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => onDelete(name.id, type)}>
                      <FaTrashAlt />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    ) : (
      <div className="alert alert-info mb-0">
        Нет связанных {type === 'male' ? 'мужских' : 'женских'} имен
      </div>
    )}
  </div>
);

export default NameDetailsModal;