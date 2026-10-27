/** Fields of the LR4 API card; LR5 fills them exclusively from local mocks. */
export interface IndexConfiguration {
  id: number
  name: string
  short_description: string
  image_url: string
  video_url: string
  table_size: number
  selectivity: number
  likes_count: number
  is_owner: 0 | 1
  is_liked: 0 | 1
}
export interface IndexFilters {
  query: string
  tableSize: number | null
}
