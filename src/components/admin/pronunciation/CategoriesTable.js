import { Table, Button, Badge, Pagination, Card } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaVolumeUp, FaPlus } from 'react-icons/fa';

const CategoriesTable = ({
  categories,
  onEdit,
  onDelete,
  onCreate, 
  searchTerm,
  currentPage,
  totalPages,
  onPageChange
}) => (
  <Card className="border-0 shadow-sm">
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead className="table-light">
          <tr>
            <th width="60" className="ps-4">ID</th>
            <th>Категория</th>
            <th width="100">Слова</th>
            <th width="120" className="text-center pe-4">Действия</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 ? (
            categories.map(category => (
              <tr key={category.id}>
                <td className="align-middle ps-4">{category.id}</td>
                <td className="align-middle">
                  <div className="d-flex align-items-center">
                    <FaVolumeUp className="me-2 text-muted" />
                    {category.name}
                  </div>
                </td>
                <td className="align-middle">
                  <Badge bg="info" className="py-2 px-2">
                    {category.wordItems?.length || 0}
                  </Badge>
                </td>
                <td className="align-middle pe-4">
                  <div className="d-flex justify-content-center gap-2 action-buttons">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => onEdit(category)}
                      className="px-2 py-1"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDelete(category)}
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
                  {searchTerm ? 'Ничего не найдено' : 'Нет категорий'}
                </div>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => onCreate()}
                  className="px-3"
                >
                  <FaPlus className="me-2" /> Добавить
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
          Страница {currentPage} из {totalPages}
        </div>
        <Pagination className="mb-0">
          <Pagination.Prev 
            disabled={currentPage === 1}
            onClick={() => onPageChange(p => p - 1)}
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
                onClick={() => onPageChange(page)}
              >
                {page}
              </Pagination.Item>
            );
          })}
          <Pagination.Next 
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(p => p + 1)}
          />
        </Pagination>
      </div>
    )}
  </Card>
);

export default CategoriesTable;
