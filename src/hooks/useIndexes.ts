import { useEffect, useState } from 'react'
import { loadMockIndexes } from '../modules/mock'
import type { IndexConfiguration } from '../types'
export function useIndexes() {
  const [indexes, setIndexes] = useState<IndexConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    void loadMockIndexes().then((items) => {
      if (active) {
        setIndexes(items)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])
  return { indexes, loading }
}
