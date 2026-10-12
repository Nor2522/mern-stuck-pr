import type { Pagination } from "./api"
import type { UserSummary } from "./user"

export type PostStatus = "published" | "hidden"

export interface PostImage {
  url?: string
  publicId?: string
}

export interface PostCategory {
  _id: string
  name: string
  slug: string
}

export interface PostType {
  _id: string
  title: string
  description: string
  image?: PostImage
  author?: UserSummary | null
  category?: PostCategory | null
  tags: string[]
  status: PostStatus
  likesCount: number
  commentsCount: number
  createdAt: string
  updatedAt: string
}

export interface PostsResponse {
  posts: PostType[]
  pagination: Pagination
}
