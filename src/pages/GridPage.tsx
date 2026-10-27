import { useEffect } from 'react'
import { IndexCard } from '../components/IndexCard'
import { IndexFilters } from '../components/IndexFilters'
import { EmptyState } from '../components/EmptyState'
import type { IndexConfiguration, IndexFilters as Filters } from '../types'
interface Props {
  indexes: IndexConfiguration[]
  filters: Filters
  onFilterChange: (filters: Filters) => void
}
export function GridPage({ indexes, filters, onFilterChange }: Props) {
  useEffect(() => {
    document.title = 'Индексы — SQL Index Lab'
  }, [])
  return (
    <main className="content">
      <header>
        <div className="brand">ϟ SQL INDEX LAB</div>
        <h1>Индексы</h1>
        <p className="subtitle">Выберите конфигурацию для перехода к ней в ленте.</p>
      </header>
      <IndexFilters value={filters} onApply={onFilterChange} />
      <div className="section-heading">
        <h2>Конфигурации</h2>
        <span aria-live="polite">Найдено: {indexes.length}</span>
      </div>
      <div className="grid">
        {indexes.map((item) => (
          <IndexCard key={item.id} item={item} />
        ))}
      </div>
      {indexes.length === 0 && (
        <EmptyState title="Конфигурации не найдены">
          <p>Попробуйте другое название или размер таблицы.</p>
        </EmptyState>
      )}
    </main>
  )
}
