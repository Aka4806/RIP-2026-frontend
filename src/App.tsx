import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { TabBar } from './components/TabBar'
import { useIndexes } from './hooks/useIndexes'
import { FeedPage } from './pages/FeedPage'
import { GridPage } from './pages/GridPage'
import { filterIndexes, INITIAL_FILTERS } from './modules/indexes'
import type { IndexFilters } from './types'
export default function App() {
  // Shared state is passed to the two pages and navigation through props.
  const { indexes, loading } = useIndexes()
  const [filters, setFilters] = useState<IndexFilters>(INITIAL_FILTERS)
  const visibleIndexes = filterIndexes(indexes, filters)
  return (
    <div className="phone">
      {loading ? (
        <main className="loading-screen" aria-label="Загрузка конфигураций">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка…</span>
          </Spinner>
        </main>
      ) : (
        <Routes>
          <Route
            path="/indexes"
            element={
              <GridPage indexes={visibleIndexes} filters={filters} onFilterChange={setFilters} />
            }
          />
          <Route
            path="/feed/:id?"
            element={
              <FeedPage
                indexes={visibleIndexes}
                onResetFilters={() => setFilters(INITIAL_FILTERS)}
              />
            }
          />
          <Route path="*" element={<Navigate to="/indexes" replace />} />
        </Routes>
      )}
      <TabBar firstIndexId={visibleIndexes[0]?.id} />
    </div>
  )
}
