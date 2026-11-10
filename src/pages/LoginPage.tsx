import { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../store'
export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  return (
    <main className="content">
      <h1>Вход</h1>
      <Form
        onSubmit={async (event) => {
          event.preventDefault()
          if (await signIn(username.trim(), password)) navigate('/indexes')
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
