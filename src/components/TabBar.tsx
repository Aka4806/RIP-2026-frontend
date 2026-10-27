import { Nav, Navbar } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from './Icon'
export function TabBar({ firstIndexId }: { firstIndexId: number | undefined }) {
  const { pathname } = useLocation()
  const feedActive = pathname.startsWith('/feed')
  return (
    <Navbar className="bottom-nav" aria-label="Основная навигация">
      <Nav className="app-tabs">
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={firstIndexId ? `/feed/${firstIndexId}` : '/feed'}
            active={feedActive}
            aria-current={feedActive ? 'page' : undefined}
          >
            <Icon name="feed" />
            <span>Лента</span>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <button
            type="button"
            className="nav-link"
            disabled
            title="Добавление будет доступно в следующей лабораторной"
          >
            <Icon name="add" />
            <span>Добавление</span>
          </button>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as={Link}
            to="/indexes"
            active={pathname === '/indexes'}
            aria-current={pathname === '/indexes' ? 'page' : undefined}
          >
            <Icon name="grid" />
            <span>Плитка</span>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <button
            type="button"
            className="nav-link"
            disabled
            title="Вход будет доступен в следующей лабораторной"
          >
            <Icon name="login" />
            <span>Войти</span>
          </button>
        </Nav.Item>
      </Nav>
    </Navbar>
  )
}
