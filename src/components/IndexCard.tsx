import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { IndexImage } from './IndexImage'
import { formatNumber } from '../modules/indexes'
import type { IndexConfiguration } from '../types'
export function IndexCard({ item }: { item: IndexConfiguration }) {
  return (
    <Card as="article" className="index-card">
      <Link
        to={`/feed/${item.id}`}
        className="card-link"
        aria-label={`Открыть ${item.name} в ленте`}
      >
        <IndexImage src={item.image_url} alt={`Схема ${item.name}`} className="card-image" />
        <Card.Body>
          <Card.Title as="h3">{item.name}</Card.Title>
          <Card.Text>{formatNumber(item.table_size)} строк</Card.Text>
          <Card.Text>Селективность {item.selectivity}</Card.Text>
          <div className="card-meta">
            <span aria-label={`Лайков: ${item.likes_count}`}>
              <Icon name="heart" />
              {item.likes_count}
            </span>
            <span aria-hidden="true">↗</span>
          </div>
        </Card.Body>
      </Link>
    </Card>
  )
}
