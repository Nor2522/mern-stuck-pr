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

export type ReportReason =
  | "spam"
  | "harassment"
  | "misleading"
  | "inappropriate"
  | "other"

export type ReportStatus = "open" | "resolved" | "dismissed"

export interface ReportPostRef {
  _id: string
  title: string
  status: PostStatus
}

export interface ReportUserRef {
  _id: string
  name: string
  email?: string
  avatar?: UserAvatar
}

export interface AdminReport {
  _id: string
  post?: ReportPostRef | null
  reporter?: ReportUserRef | null
  reason: ReportReason
  details: string
  status: ReportStatus
  resolvedBy?: { _id: string; name: string } | null
  resolvedAt?: string | null
  createdAt: string
}

export interface AdminReportsResponse {
  reports: AdminReport[]
  pagination: Pagination
}

export interface AdminComment {
  _id: string
  text: string
  post?: ReportPostRef | null
  author?: ReportUserRef | null
  createdAt: string
}

export interface AdminCommentsResponse {
  comments: AdminComment[]
  pagination: Pagination
}