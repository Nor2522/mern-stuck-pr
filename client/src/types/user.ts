export type UserRole = "user" | "admin"

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: UserRole
}

export interface LoginResponse {
  success: boolean
  message: string
  userData: { user: AuthUser }
  expire: number
}
