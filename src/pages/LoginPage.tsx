import { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { setAuthPending, setError, setUser, useAppDispatch } from '../store'
import { TOKEN_KEY, authorizeRequests, errorMessage } from '../api/client'
export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  return (
    <main className="content login-page">
      <h1>Вход</h1>
      <Form
        onSubmit={async (event) => {
          event.preventDefault()
          dispatch(setAuthPending(true))
          try {
            const { data } = await axios.post(
              '/api/users/authentication',
              { username: username.trim(), password },
              { timeout: 10000 },
            )
            if (!data.access_token || !data.user?.id)
              throw new Error('Некорректный ответ аутентификации')
            localStorage.setItem(TOKEN_KEY, data.access_token)
            authorizeRequests(data.access_token)
            dispatch(setUser(data.user))
            navigate('/indexes', { replace: true })
          } catch (error) {
            dispatch(setError(errorMessage(error)))
          } finally {
            dispatch(setAuthPending(false))
          }
        }}
      >
        <Form.Group controlId="username">
          <Form.Label>Имя пользователя</Form.Label>
          <Form.Control
            value={username}
            autoComplete="username"
            maxLength={100}
            required
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Пароль</Form.Label>
          <Form.Control
            type="password"
            value={password}
            autoComplete="current-password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button type="submit" variant="success">
          Войти
        </Button>
      </Form>
    </main>
  )
}
