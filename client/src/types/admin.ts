import type { Pagination } from "./api"
import type { PostStatus } from "./post"
import type { UserAvatar, UserRole, UserSummary } from "./user"

export interface AdminTotals {
  users: number
  posts: number
  comments: number
  openReports: number
}

export interface AdminDailyPoint {
  date: string
  count: number
}

export interface AdminLatestUser {
  _id: string
  name: string
  email: string
  role: UserRole
  avatar?: UserAvatar
  createdAt: string
}

export interface AdminLatestPost {
  _id: string
  title: string
  status: PostStatus
  createdAt: string
  author?: UserSummary | null
}

export interface AdminStats {
  totals: AdminTotals
  daily: {
    users: AdminDailyPoint[]
    posts: AdminDailyPoint[]
  }
  latestUsers: AdminLatestUser[]
  latestPosts: AdminLatestPost[]
}

export interface AdminUser {
  _id: string
  name: string
  email: string
  role: UserRole
  isBanned: boolean
  avatar?: UserAvatar | null
  createdAt: string
  postsCount: number
}

export interface AdminUsersResponse {
  users: AdminUser[]
  pagination: Pagination
}