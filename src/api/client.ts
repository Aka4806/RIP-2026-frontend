import axios from 'axios'
import { Api } from './Api'
import type { IndexConfiguration } from '../types'

export const api = new Api({ baseURL: '/', timeout: 10000 })
export const authClient = axios.create({ baseURL: '/api/users', timeout: 10000 })
export const TOKEN_KEY = 'sql-index-jwt'
export function authorizeRequests(token: string | null) {
  if (token) api.instance.defaults.headers.common.Authorization = `Bearer ${token}`
  else delete api.instance.defaults.headers.common.Authorization
}
export function indexCard(data: unknown): IndexConfiguration {
  const card = data as IndexConfiguration
  const media = (url: string) => {
    if (!url) return ''
    if (url.startsWith('/')) return url
    const parsed = new URL(url)
    return `/s3${parsed.pathname}${parsed.search}`
  }
  return { ...card, image_url: media(card.image_url), video_url: media(card.video_url) }
}
export function unavailable(error: unknown) {
  return (
    axios.isAxiosError(error) &&
    (!error.response || [502, 503, 504].includes(error.response.status))
  )
}
export function errorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return 'Не удалось выполнить действие.'
  const messages: Record<number, string> = {
    400: 'Проверьте заполненные поля.',
    401: 'Войдите в аккаунт. Токен мог истечь.',
    404: 'Карточка недоступна или удалена.',
    409: 'Черновик уже существует или имя пользователя занято.',
    413: 'Файл слишком большой.',
    415: 'Неподдерживаемый формат данных.',
    500: 'Ошибка сервера.',
    503: 'Сервис временно недоступен.',
  }
  return error.response
    ? messages[error.response.status] || 'Ошибка запроса.'
    : 'Сервер недоступен. Проверьте подключение.'
}
