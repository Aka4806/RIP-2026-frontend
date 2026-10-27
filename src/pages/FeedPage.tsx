import { useEffect } from 'react'
import { Badge, Button } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { FeedMedia } from '../components/FeedMedia'
import { Icon } from '../components/Icon'
import { formatNumber, nextIndex } from '../modules/indexes'
import type { IndexConfiguration } from '../types'
interface Props {
  indexes: IndexConfiguration[]
  onResetFilters: () => void
}
export function FeedPage({ indexes, onResetFilters }: Props) {
  const { id } = useParams<{ id: string }>()
  const selectedId = id === undefined ? indexes[0]?.id : /^\d+$/.test(id) ? Number(id) : undefined
  const item = indexes.find((index) => index.id === selectedId)
  const next = item ? nextIndex(indexes, item.id) : undefined
  useEffect(() => {
    document.title = item ? `${item.name} — SQL Index Lab` : 'Лента — SQL Index Lab'
  }, [item])
  if (!item)
    return (
      <main className="content feed-empty">
        <div className="brand">ϟ SQL INDEX LAB</div>
        <EmptyState
          title={indexes.length === 0 ? 'В ленте пока нет карточек' : 'Конфигурация не найдена'}
        >
          <p>Выберите карточку в плитке или сбросьте фильтры.</p>
          <Button variant="success" onClick={onResetFilters}>
            Сбросить фильтры
          </Button>
          <Link to="/indexes" className="back-link">
            К плитке
          </Link>
        </EmptyState>
      </main>
    )
  return (
    <main className="feed">
      <FeedMedia key={item.id} item={item} />
      <header className="feed-header">
        <div className="brand">ϟ SQL INDEX LAB</div>
        <Badge className="publication-badge" bg="success">
          опубликован
        </Badge>
      </header>
      <aside className="feed-actions" aria-label="Параметры конфигурации">
        <div className="metric">
          <strong>{formatNumber(item.table_size)}</strong>
          <span>строк</span>
        </div>
        <div className="metric">
          <strong>{item.selectivity}</strong>
          <span>селективность</span>
        </div>
        <div
          className="metric metric-likes"
          aria-label={`Лайков: ${item.likes_count}`}
          title="Лайки доступны после входа"
        >
          <Icon name="heart" />
          <strong>{item.likes_count}</strong>
        </div>
        {next && (
          <Link className="next" to={`/feed/${next.id}`} aria-label="Следующая конфигурация">
            <Icon name="next" />
            <span>Следующий</span>
          </Link>
        )}
      </aside>
      <section className="feed-caption">
        <h1>{item.name}</h1>
        <details key={item.id} className="feed-description">
          <summary>
            <span className="description-text">{item.short_description}</span>
            <span className="more">больше</span>
            <span className="less">меньше</span>
          </summary>
        </details>
      </section>
    </main>
  )
}
