import { Nav, Navbar } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import axios from 'axios'
import { setAuthPending, setError, setUser, useAppDispatch, useAppSelector } from '../store'
import { TOKEN_KEY, authorizeRequests, errorMessage } from '../api/client'
export function TabBar() {
  const user = useAppSelector((s) => s.indexes.user)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
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
                dispatch(setAuthPending(true))
                try {
                  const token = localStorage.getItem(TOKEN_KEY)
                  await axios.post('/api/users/authorization', null, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000,
                  })
                  localStorage.removeItem(TOKEN_KEY)
                  authorizeRequests(null)
                  dispatch(setUser(null))
                  navigate('/indexes')
                } catch (error) {
                  dispatch(setError(errorMessage(error)))
                } finally {
                  dispatch(setAuthPending(false))
                }
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
