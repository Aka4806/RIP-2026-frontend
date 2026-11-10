import { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { formatNumber, INITIAL_FILTERS, TABLE_SIZES } from '../modules/indexes'
import type { IndexFilters as Filters } from '../types'
interface Props {
  value: Filters
  onApply: (filters: Filters) => void
}
export function IndexFilters({ value, onApply }: Props) {
  const [draft, setDraft] = useState(value)
  const step = TABLE_SIZES.findIndex((size) => size === draft.tableSize)
  function reset() {
    setDraft(INITIAL_FILTERS)
    onApply(INITIAL_FILTERS)
  }
  return (
    <Form
      className="filter"
      onSubmit={(event) => {
        event.preventDefault()
        onApply(draft)
      }}
    >
      <Form.Group className="name-filter" controlId="index-name">
        <Form.Label>Название индекса</Form.Label>
        <Form.Control
          type="search"
          placeholder="Например, B-tree"
          value={draft.query}
          onChange={(event) => setDraft({ ...draft, query: event.target.value })}
        />
      </Form.Group>
      <div className="filter-header">
        <Form.Label htmlFor="table-size">Размер таблицы</Form.Label>
        <output htmlFor="table-size">
          {draft.tableSize === null ? 'Все размеры' : `${formatNumber(draft.tableSize)} строк`}
        </output>
      </div>
      <Form.Range
        id="table-size"
        min={0}
        max={3}
        step={1}
        value={step}
        aria-valuetext={
          draft.tableSize === null ? 'Все размеры' : `${formatNumber(draft.tableSize)} строк`
        }
        aria-describedby="size-labels"
        onChange={(event) =>
          setDraft({ ...draft, tableSize: TABLE_SIZES[Number(event.target.value)] ?? null })
        }
      />
      <div id="size-labels" className="slider-labels" aria-hidden="true">
        <span>Все</span>
        <span>100K</span>
        <span>1M</span>
        <span>10M</span>
      </div>
      <div className="filter-footer">
        <Button type="button" variant="link" onClick={reset}>
          Сбросить
        </Button>
        <Button type="submit" variant="success">
          Применить
        </Button>
      </div>
    </Form>
  )
}
