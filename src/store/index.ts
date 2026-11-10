import { configureStore, createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import {
  api,
  authClient,
  authorizeRequests,
  TOKEN_KEY,
  indexCard,
  unavailable,
  errorMessage,
} from '../api/client'
import { INDEXES_MOCK } from '../modules/mock'
import { INITIAL_FILTERS, filterIndexes, nextIndex } from '../modules/indexes'
import type { IndexConfiguration, IndexFilters } from '../types'

interface State {
  user: { id: number; username: string } | null
  filters: IndexFilters
  indexes: IndexConfiguration[]
  feed: IndexConfiguration | null
  draft: IndexConfiguration | null
  pending: number
  authPending: boolean
  error: string
  mock: boolean
  listRequest: string
  feedRequest: string
}
const initialState: State = {
  user: null,
  filters: INITIAL_FILTERS,
  indexes: [],
  feed: null,
  draft: null,
  pending: 0,
  authPending: false,
  error: '',
  mock: false,
  listRequest: '',
  feedRequest: '',
}
type Context = { state: { indexes: State }; rejectValue: string }
const guestCards = INDEXES_MOCK.map((card) => ({
  ...card,
  is_owner: 0 as const,
  is_liked: 0 as const,
}))

export const loadIndexes = createAsyncThunk<
  { cards: IndexConfiguration[]; mock: boolean },
  void,
  Context
>('indexes/loadIndexes', async (_, { getState, rejectWithValue }) => {
  const { filters, user } = getState().indexes
  try {
    const response = await api.api.listIndexes({ table_size: filters.tableSize ?? undefined })
    return { cards: filterIndexes((response.data || []).map(indexCard), filters), mock: false }
  } catch (error) {
    if (!user && unavailable(error))
      return { cards: filterIndexes(guestCards, filters), mock: true }
    return rejectWithValue(errorMessage(error))
  }
})
export const loadIndexFeed = createAsyncThunk<
  { card: IndexConfiguration | null; mock: boolean },
  { id?: string; next?: boolean },
  Context
>('indexes/loadIndexFeed', async ({ id = '', next = false }, { getState, rejectWithValue }) => {
  try {
    const response = await api.api.getIndexFeed(id, { next })
    return { card: indexCard(response.data), mock: false }
  } catch (error) {
    if (!getState().indexes.user && unavailable(error)) {
      const card = id ? guestCards.find((item) => item.id === Number(id)) : guestCards[0]
      return {
        card: card ? (next ? (nextIndex(guestCards, card.id) ?? null) : card) : null,
        mock: true,
      }
    }
    return rejectWithValue(errorMessage(error))
  }
})
export const loadIndexDraft = createAsyncThunk<IndexConfiguration, void, Context>(
  'indexes/loadIndexDraft',
  async (_, { rejectWithValue }) => {
    try {
      return indexCard((await api.api.getIndexDraft()).data)
    } catch (error) {
      return rejectWithValue(errorMessage(error))
    }
  },
)
export const createIndexDraft = createAsyncThunk<
  IndexConfiguration,
  { name: string; image: File; video: File },
  Context
>('indexes/createIndexDraft', async (input, { rejectWithValue }) => {
  try {
    return indexCard((await api.api.createIndexDraft(input)).data)
  } catch (error) {
    return rejectWithValue(errorMessage(error))
  }
})
export const publishIndex = createAsyncThunk<
  IndexConfiguration,
  { id: number; short_description: string; table_size: number; selectivity: number },
  Context
>('indexes/publishIndex', async ({ id, ...input }, { rejectWithValue }) => {
  try {
    return indexCard((await api.api.publishIndex(id, input)).data)
  } catch (error) {
    return rejectWithValue(errorMessage(error))
  }
})
export const deleteIndex = createAsyncThunk<number, number, Context>(
  'indexes/deleteIndex',
  async (id, { rejectWithValue }) => {
    try {
      await api.api.deleteIndex(id)
      return id
    } catch (error) {
      return rejectWithValue(errorMessage(error))
    }
  },
)
export const likeIndex = createAsyncThunk<IndexConfiguration, { id: number; like: 0 | 1 }, Context>(
  'indexes/likeIndex',
  async ({ id, like }, { rejectWithValue }) => {
    try {
      return indexCard((await api.api.likeIndex(id, { like })).data)
    } catch (error) {
      return rejectWithValue(errorMessage(error))
    }
  },
)
const operations = [
  loadIndexes,
  loadIndexFeed,
  loadIndexDraft,
  createIndexDraft,
  publishIndex,
  deleteIndex,
  likeIndex,
] as const
const slice = createSlice({
  name: 'indexes',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<IndexFilters>) {
      state.filters = action.payload
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload
    },
    setAuthPending(state, action: PayloadAction<boolean>) {
      state.authPending = action.payload
      if (action.payload) state.error = ''
    },
    setUser(state, action: PayloadAction<State['user']>) {
      state.user = action.payload
      state.indexes = []
      state.feed = null
      state.draft = null
      state.mock = false
      state.listRequest = ''
      state.feedRequest = ''
      if (!action.payload) state.filters = INITIAL_FILTERS
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadIndexes.pending, (state, action) => {
        state.listRequest = action.meta.requestId
      })
      .addCase(loadIndexFeed.pending, (state, action) => {
        state.feedRequest = action.meta.requestId
        state.feed = null
      })
      .addCase(loadIndexes.fulfilled, (state, action) => {
        if (state.listRequest === action.meta.requestId) {
          state.indexes = action.payload.cards
          state.mock = action.payload.mock
        }
      })
      .addCase(loadIndexFeed.fulfilled, (state, action) => {
        if (state.feedRequest === action.meta.requestId) {
          state.feed = action.payload.card
          state.mock = action.payload.mock
        }
      })
      .addCase(loadIndexDraft.fulfilled, (state, action) => {
        state.draft = action.payload.id ? action.payload : null
      })
      .addCase(createIndexDraft.fulfilled, (state, action) => {
        state.draft = action.payload
      })
      .addCase(publishIndex.fulfilled, (state) => {
        state.draft = null
      })
      .addCase(deleteIndex.fulfilled, (state, action) => {
        state.indexes = state.indexes.filter((item) => item.id !== action.payload)
        if (state.draft?.id === action.payload) state.draft = null
        if (state.feed?.id === action.payload) state.feed = null
      })
      .addCase(likeIndex.fulfilled, (state, action) => {
        state.feed = action.payload
        state.indexes = state.indexes.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        )
      })
      .addMatcher(isAnyOf(...operations.map((op) => op.pending)), (state) => {
        state.pending++
        state.error = ''
      })
      .addMatcher(isAnyOf(...operations.map((op) => op.fulfilled)), (state) => {
        state.pending--
      })
      .addMatcher(isAnyOf(...operations.map((op) => op.rejected)), (state, action) => {
        state.pending--
        state.error = String(action.payload || 'Ошибка запроса.')
      })
  },
})
export const { setFilters, setError, setAuthPending, setUser } = slice.actions
export const store = configureStore({ reducer: { indexes: slice.reducer } })
export const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>()
export const useAppSelector = useSelector.withTypes<ReturnType<typeof store.getState>>()

// Authentication uses Axios and ordinary actions, without async thunks.
export async function signIn(username: string, password: string) {
  store.dispatch(setAuthPending(true))
  try {
    const { data } = await authClient.post('/authentication', { username, password })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    authorizeRequests(data.access_token)
    store.dispatch(setUser(data.user))
    return true
  } catch (error) {
    store.dispatch(setError(errorMessage(error)))
    return false
  } finally {
    store.dispatch(setAuthPending(false))
  }
}
export async function signOut() {
  store.dispatch(setAuthPending(true))
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    await authClient.post('/authorization', null, { headers: { Authorization: `Bearer ${token}` } })
    localStorage.removeItem(TOKEN_KEY)
    authorizeRequests(null)
    store.dispatch(setUser(null))
    return true
  } catch (error) {
    store.dispatch(setError(errorMessage(error)))
    return false
  } finally {
    store.dispatch(setAuthPending(false))
  }
}
