import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Alert, Spinner } from 'react-bootstrap'
import { TabBar } from './components/TabBar'
import { FeedPage } from './pages/FeedPage'
import { GridPage } from './pages/GridPage'
import { LoginPage } from './pages/LoginPage'
import { AddPage } from './pages/AddPage'
import { warmSessionFeed } from './api/sessionFeed'
import { loadIndexes, setFilters, setPage, setError, useAppDispatch, useAppSelector } from './store'
export default function App() {
  const state = useAppSelector((s) => s.indexes)
  const dispatch = useAppDispatch()
  const { pathname } = useLocation()
  const busy = state.pending > 0 || state.authPending
  useEffect(() => {
    void warmSessionFeed().catch(() => undefined)
  }, [])
  useEffect(() => {
    if (pathname === '/indexes') void dispatch(loadIndexes())
  }, [dispatch, pathname, state.filters, state.user, state.page, state.listVersion])
  return (
    <div className="phone">
      {state.error && (
        <Alert
          className="status-banner"
          variant="danger"
          dismissible
          onClose={() => dispatch(setError(''))}
        >
          {state.error}
        </Alert>
      )}
      {state.mock && (
        <div className="offline-banner">Сервер недоступен. Демонстрационные карточки.</div>
      )}
      <div className="page-shell" inert={busy}>
        <Routes>
          <Route
            path="/indexes"
            element={
              <GridPage
                indexes={state.indexes}
                filters={state.filters}
                page={state.page}
                total={state.total}
                onPageChange={(page) => dispatch(setPage(page))}
                onFilterChange={(filters) => dispatch(setFilters(filters))}
              />
            }
          />
          <Route path="/feed/:id?" element={<FeedPage />} />
          <Route
            path="/login"
            element={state.user ? <Navigate to="/indexes" replace /> : <LoginPage />}
          />
          <Route
            path="/add"
            element={state.user ? <AddPage /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to="/indexes" replace />} />
        </Routes>
        <TabBar />
      </div>
      {busy && (
        <div className="busy-overlay" role="status">
          <Spinner animation="border" />
          <span>Загрузка…</span>
        </div>
      )}
    </div>
  )
}
