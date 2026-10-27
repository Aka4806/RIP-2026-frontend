import type { IndexConfiguration, IndexFilters } from '../types'
export const INITIAL_FILTERS: IndexFilters = { query: '', tableSize: null }
export const TABLE_SIZES = [null, 100_000, 1_000_000, 10_000_000] as const
export const formatNumber = (value: number) => new Intl.NumberFormat('ru-RU').format(value)
export function filterIndexes(items: IndexConfiguration[], filters: IndexFilters) {
  const query = filters.query.trim().toLocaleLowerCase('ru-RU')
  return items.filter(
    (item) =>
      (filters.tableSize === null || item.table_size === filters.tableSize) &&
      item.name.toLocaleLowerCase('ru-RU').includes(query),
  )
}
export function nextIndex(items: IndexConfiguration[], id: number) {
  const current = items.findIndex((item) => item.id === id)
  return current < 0 || items.length === 0 ? undefined : items[(current + 1) % items.length]
}
