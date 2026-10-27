import type { IndexConfiguration } from '../types'

/** The only card-data source. Media belongs to public/media, never S3. */
export const INDEXES_MOCK: readonly IndexConfiguration[] = [
  {
    id: 1,
    name: 'B-tree 100K',
    short_description:
      'B-tree хранит ключи в отсортированном виде. Подходит для точного поиска, выборки диапазонов и сортировки результатов. Сбалансированное дерево сохраняет небольшую глубину даже при увеличении количества строк.',
    image_url: '/media/user/btree_100k.png',
    video_url: '/media/user/btree_100k.mp4',
    table_size: 100000,
    selectivity: 0.01,
    likes_count: 3,
    is_owner: 0,
    is_liked: 0,
  },
  {
    id: 2,
    name: 'Hash 100K',
    short_description:
      'Hash находит записи по хешу ключа. Подходит для поиска по равенству, но не поддерживает диапазоны и сортировку. Коллизии требуют дополнительной проверки ключей.',
    image_url: '/media/user/hash_100k.png',
    video_url: '/media/user/hash_100k.mp4',
    table_size: 100000,
    selectivity: 0.01,
    likes_count: 1,
    is_owner: 0,
    is_liked: 0,
  },
  {
    id: 3,
    name: 'Bitmap 100K',
    short_description:
      'Bitmap хранит битовые карты значений. Удобен для аналитических запросов и полей с небольшим числом различных значений. Условия можно объединять битовыми операциями.',
    image_url: '/media/user/bitmap_100k.png',
    video_url: '/media/user/bitmap_100k.mp4',
    table_size: 100000,
    selectivity: 0.1,
    likes_count: 2,
    is_owner: 0,
    is_liked: 0,
  },
  {
    id: 4,
    name: 'B-tree 1M',
    short_description:
      'B-tree хранит ключи в отсортированном виде. Подходит для точного поиска, выборки диапазонов и сортировки результатов. Сбалансированное дерево сохраняет небольшую глубину даже при увеличении количества строк.',
    image_url: '/media/user/btree_1m.png',
    video_url: '/media/user/btree_1m.mp4',
    table_size: 1000000,
    selectivity: 0.01,
    likes_count: 5,
    is_owner: 0,
    is_liked: 0,
  },
  {
    id: 5,
    name: 'Hash 1M',
    short_description:
      'Hash находит записи по хешу ключа. Подходит для поиска по равенству, но не поддерживает диапазоны и сортировку. Коллизии требуют дополнительной проверки ключей.',
    image_url: '',
    video_url: '',
    table_size: 1000000,
    selectivity: 0.01,
    likes_count: 2,
    is_owner: 0,
    is_liked: 0,
  },
  {
    id: 6,
    name: 'Bitmap 1M',
    short_description:
      'Bitmap хранит битовые карты значений. Удобен для аналитических запросов и полей с небольшим числом различных значений. Условия можно объединять битовыми операциями.',
    image_url: '/media/user/bitmap_1m.png',
    video_url: '/media/user/bitmap_1m.mp4',
    table_size: 1000000,
    selectivity: 0.1,
    likes_count: 4,
    is_owner: 0,
    is_liked: 0,
  },
  {
    id: 7,
    name: 'B-tree 10M',
    short_description:
      'B-tree хранит ключи в отсортированном виде. Подходит для точного поиска, выборки диапазонов и сортировки результатов. Сбалансированное дерево сохраняет небольшую глубину даже при увеличении количества строк.',
    image_url: '/media/user/btree_10m.png',
    video_url: '/media/user/btree_10m.mp4',
    table_size: 10000000,
    selectivity: 0.001,
    likes_count: 3,
    is_owner: 0,
    is_liked: 0,
  },
  {
    id: 8,
    name: 'Hash 10M',
    short_description:
      'Hash находит записи по хешу ключа. Подходит для поиска по равенству, но не поддерживает диапазоны и сортировку. Коллизии требуют дополнительной проверки ключей.',
    image_url: '',
    video_url: '',
    table_size: 10000000,
    selectivity: 0.001,
    likes_count: 0,
    is_owner: 0,
    is_liked: 0,
  },
  {
    id: 9,
    name: 'Bitmap 10M',
    short_description:
      'Bitmap хранит битовые карты значений. Удобен для аналитических запросов и полей с небольшим числом различных значений. Условия можно объединять битовыми операциями.',
    image_url: '',
    video_url: '',
    table_size: 10000000,
    selectivity: 0.1,
    likes_count: 1,
    is_owner: 0,
    is_liked: 0,
  },
]

// Explicit async loading boundary without HTTP requests or an API fallback.
export async function loadMockIndexes(): Promise<IndexConfiguration[]> {
  return INDEXES_MOCK.map((item) => ({ ...item }))
}
