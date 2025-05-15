import { Table, Button, Badge, Pagination, Card } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';

const WordsTable = ({
  words,
  onEdit,
  onDelete,
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
            <th>Слово</th>
            <th>Изображение</th>
            <th width="120" className="text-center pe-4">Действия</th>
          </tr>
        </thead>
        <tbody>
          {words.length > 0 ? (
            words.map(word => (
              <tr key={word.id}>
                <td className="align-middle ps-4">{word.id}</td>
                <td className="align-middle">{word.name}</td>
                <td className="align-middle">
                  {word.imagePath ? (
                    <a href={word.imagePath} target="_blank" rel="noopener noreferrer">
                      <Badge bg="light" text="dark" className="py-2 px-2">
                        Просмотр
                      </Badge>
                    </a>
                  ) : (
                    <Badge bg="secondary" className="py-2 px-2">
                      Нет изображения
                    </Badge>
                  )}
                </td>
                <td className="align-middle pe-4">
                  <div className="d-flex justify-content-center gap-2 action-buttons">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => onEdit(word)}
                      className="px-2 py-1"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDelete(word)}
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
                  {searchTerm ? 'Ничего не найдено' : 'Нет слов'}
                </div>
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

export default WordsTable;