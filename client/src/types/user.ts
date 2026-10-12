export type UserRole = "user" | "admin"

export interface UserAvatar {
  url?: string
  publicId?: string
}

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: UserRole
  avatar?: UserAvatar
  bio?: string
}

export interface UserSummary {
  _id: string
  name: string
  avatar?: UserAvatar
}

export interface LoginResponse {
  success: boolean
  message: string
  userData: { user: AuthUser }
  expire: number
}
