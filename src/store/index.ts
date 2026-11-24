import { configureStore, createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { api, indexCard, unavailable, errorMessage } from '../api/client'
import { INDEXES_MOCK } from '../modules/mock'
import { warmSessionFeed } from '../api/sessionFeed'
import { INITIAL_FILTERS, filterIndexes } from '../modules/indexes'
import type { IndexConfiguration, IndexFilters } from '../types'

interface State {
  user: { id: number; username: string } | null
  filters: IndexFilters
  indexes: IndexConfiguration[]
  page: number
  total: number
  listVersion: number
  feedPosition: number
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
  page: 1,
  total: 0,
  listVersion: 0,
  feedPosition: 0,
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

export const PAGE_SIZE = 12

export const loadIndexes = createAsyncThunk<
  { cards: IndexConfiguration[]; total: number; mock: boolean },
  void,
  Context
>('indexes/loadIndexes', async (_, { getState, rejectWithValue }) => {
  const { filters, user, page } = getState().indexes
  const mockPage = () => {
    const cards = filterIndexes(guestCards, filters)
    return { cards: cards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: cards.length, mock: true }
  }
  try {
    const { data } = await api.api.listIndexes({
      table_size: filters.tableSize ?? undefined,
      name: filters.query.trim() || undefined,
      page,
      limit: PAGE_SIZE,
    })
    return { cards: (data.data ?? []).map(indexCard), total: data.total ?? 0, mock: false }
  } catch (error) {
    if (!user && unavailable(error)) return mockPage()
    return rejectWithValue(errorMessage(error))
  }
})

export const loadIndexFeed = createAsyncThunk<
  { card: IndexConfiguration | null; position: number; mock: boolean },
  { id?: string; position?: number },
  Context
>('indexes/loadIndexFeed', async ({ id, position = 1 }, { getState, rejectWithValue }) => {
  const mockFeed = () => ({
    card: (id ? guestCards.find(item => item.id === Number(id)) : guestCards[(position - 1) % guestCards.length]) ?? null,
    position: id ? 0 : position,
    mock: true,
  })
  try {
    if (id) {
      const {data} = await api.api.getIndexFeed(id)
      return {card: indexCard(data), position: 0, mock: false}
    }
    await warmSessionFeed()
    const {data} = await api.api.getSessionFeed({position})
    return {card: indexCard(data), position: data.position ?? 1, mock: false}
  } catch (error) {
    if (!getState().indexes.user && unavailable(error)) return mockFeed()
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
  {
    id: number
    name: string
    short_description: string
    table_size: number
    selectivity: number
    image?: File
    video?: File
  },
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
      state.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
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
      state.feedPosition = 0
      state.page = 1
      state.total = 0
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
          state.total = action.payload.total
          const lastPage = Math.max(1, Math.ceil(state.total / PAGE_SIZE))
          if (state.page > lastPage) state.page = lastPage
          state.indexes = action.payload.cards
          state.mock = action.payload.mock
        }
      })
      .addCase(loadIndexFeed.fulfilled, (state, action) => {
        if (state.feedRequest === action.meta.requestId) {
          state.feed = action.payload.card
          state.feedPosition = action.payload.position
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
        state.listVersion++
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
export const { setFilters, setPage, setError, setAuthPending, setUser } = slice.actions
export const store = configureStore({ reducer: { indexes: slice.reducer } })
export const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>()
export const useAppSelector = useSelector.withTypes<ReturnType<typeof store.getState>>()
