import type { Pagination } from "./api"
import type { UserSummary } from "./user"

export interface CommentType {
  _id: string
  post: string
  text: string
  author?: UserSummary | null
  createdAt: string
  updatedAt: string
}

export interface CommentsResponse {
  comments: CommentType[]
  pagination: Pagination
}
