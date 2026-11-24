import { useEffect } from 'react'
import { IndexCard } from '../components/IndexCard'
import { IndexFilters } from '../components/IndexFilters'
import { Pagination } from 'react-bootstrap'
import { PAGE_SIZE } from '../store'
import { formatNumber } from '../modules/indexes'
import { EmptyState } from '../components/EmptyState'
import type { IndexConfiguration, IndexFilters as Filters } from '../types'
interface Props {
  indexes: IndexConfiguration[]
  filters: Filters
  page: number
  total: number
  onPageChange: (page: number) => void
  onFilterChange: (filters: Filters) => void
}
export function GridPage({ indexes, filters, page, total, onPageChange, onFilterChange }: Props) {
  useEffect(() => {
    document.title = 'Индексы — SQL Index Lab'
  }, [])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const windowStart = Math.max(1, Math.min(page - 1, pages - 2))
  const displayed = Array.from({ length: Math.min(3, pages) }, (_, index) => windowStart + index)
  return (
    <main className="content grid-page">
      <header>
        <div className="brand">ϟ SQL INDEX LAB</div>
        <h1>Индексы</h1>
        <p className="subtitle">Выберите конфигурацию для перехода к ней в ленте.</p>
      </header>
      <IndexFilters key={JSON.stringify(filters)} value={filters} onApply={onFilterChange} />
      <div className="section-heading">
        <h2>Конфигурации</h2>
        <span aria-live="polite">Найдено: {formatNumber(total)}</span>
      </div>
      <div className="grid">
        {indexes.map((item) => (
          <IndexCard key={item.id} item={item} />
        ))}
      </div>
      {pages > 1 && (
        <nav className="catalog-pagination" aria-label="Страницы плитки">
          <span>Страница {formatNumber(page)} из {formatNumber(pages)}</span>
          <Pagination size="sm">
            <Pagination.First disabled={page === 1} onClick={() => onPageChange(1)} aria-label="Первая страница" />
            <Pagination.Prev disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Предыдущая страница" />
            {displayed.map(number => (
              <Pagination.Item key={number} active={number === page} onClick={() => onPageChange(number)}>{number}</Pagination.Item>
            ))}
            <Pagination.Next disabled={page === pages} onClick={() => onPageChange(page + 1)} aria-label="Следующая страница" />
            <Pagination.Last disabled={page === pages} onClick={() => onPageChange(pages)} aria-label="Последняя страница" />
          </Pagination>
        </nav>
      )}
      {indexes.length === 0 && (
        <EmptyState title="Конфигурации не найдены">
          <p>Попробуйте другое название или размер таблицы.</p>
        </EmptyState>
      )}
    </main>
  )
}
