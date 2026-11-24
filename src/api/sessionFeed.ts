import { api } from './client'

let prepared = false
let loading: Promise<void> | undefined

// One request initializes the cookie even if React mounts effects twice.
export function warmSessionFeed(): Promise<void> {
  if (prepared) return Promise.resolve()
  loading ??= api.api.getSessionFeed({ position: 1 })
    .then(() => { prepared = true })
    .finally(() => { loading = undefined })
  return loading
}
