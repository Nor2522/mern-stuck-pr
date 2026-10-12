export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiMessage {
  success: boolean
  message: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
