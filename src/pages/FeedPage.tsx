import { useEffect } from 'react'
import { Badge, Button } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FeedMedia } from '../components/FeedMedia'
import { Icon } from '../components/Icon'
import { formatNumber } from '../modules/indexes'
import { likeIndex, loadIndexFeed, useAppDispatch, useAppSelector } from '../store'
export function FeedPage() {
  const { id } = useParams<{ id: string }>()
  const { feed: item, user } = useAppSelector((s) => s.indexes)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  useEffect(() => {
    void dispatch(loadIndexFeed({ id }))
  }, [dispatch, id, user])
  if (!item)
    return (
      <main className="content">
        <h1>Лента</h1>
        <p>Карточка недоступна.</p>
        <Link to="/indexes">К плитке</Link>
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
        <button
          className="metric metric-likes"
          disabled={!user}
          aria-label={item.is_liked ? 'Отменить лайк' : 'Поставить лайк'}
          aria-pressed={!!item.is_liked}
          onClick={() => void dispatch(likeIndex({ id: item.id, like: item.is_liked ? 0 : 1 }))}
        >
          <Icon name="heart" />
          <strong>{item.likes_count}</strong>
        </button>
        <Button
          className="next"
          variant="light"
          onClick={async () => {
            const result = await dispatch(loadIndexFeed({ id: String(item.id), next: true }))
            if (loadIndexFeed.fulfilled.match(result) && result.payload.card)
              navigate(`/feed/${result.payload.card.id}`)
          }}
        >
          <Icon name="next" />
          <span>Следующий</span>
        </Button>
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
