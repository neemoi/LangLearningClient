import React from 'react';
import { Button, Card, InputGroup, FormControl, Badge } from 'react-bootstrap';
import { FaSearch, FaSyncAlt, FaPlus } from 'react-icons/fa';

const CategoriesToolbar = ({
  searchTerm,
  setSearchTerm,
  isRefreshing,
  onRefresh,
  onCreate,
  categories,
  filteredCategories
}) => (
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
          {searchTerm && (
            <Button 
              variant="outline-secondary" 
              onClick={() => setSearchTerm('')}
            >
              Очистить
            </Button>
          )}
        </InputGroup>

        <div className="d-flex gap-3">
          <Button 
            variant="light" 
            onClick={onRefresh}
            className="px-3"
            disabled={isRefreshing}
          >
            <FaSyncAlt className={isRefreshing ? 'spin' : ''} />
          </Button>
          
          <Button 
            variant="primary" 
            onClick={onCreate}
            className="d-flex align-items-center px-4"
          >
            <FaPlus className="me-2" /> Добавить
          </Button>
        </div>
      </div>

      <div className="d-flex gap-2">
        <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
          Всего: {categories.length}
        </Badge>
        <Badge bg="light" text="dark" className="px-3 py-2 fw-normal">
          Найдено: {filteredCategories.length}
        </Badge>
      </div>
    </Card.Body>
  </Card>
);

export default CategoriesToolbar;