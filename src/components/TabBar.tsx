import { Nav, Navbar } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { signOut, useAppSelector } from '../store'
export function TabBar() {
  const user = useAppSelector((s) => s.indexes.user)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <Navbar className="bottom-nav" aria-label="Основная навигация">
      <Nav className="app-tabs">
        <Nav.Item>
          <Nav.Link as={Link} to="/feed" active={pathname.startsWith('/feed')}>
            <Icon name="feed" />
            <span>Лента</span>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/add" disabled={!user} active={pathname === '/add'}>
            <Icon name="add" />
            <span>Добавление</span>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="/indexes" active={pathname === '/indexes'}>
            <Icon name="grid" />
            <span>Плитка</span>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          {user ? (
            <button
              className="nav-link"
              onClick={async () => {
                if (await signOut()) navigate('/indexes')
              }}
            >
              <Icon name="login" />
              <span>Выход</span>
            </button>
          ) : (
            <Nav.Link as={Link} to="/login" active={pathname === '/login'}>
              <Icon name="login" />
              <span>Вход</span>
            </Nav.Link>
          )}
        </Nav.Item>
      </Nav>
    </Navbar>
  )
}
