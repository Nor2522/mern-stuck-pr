import { createContext, useContext } from "react"
import type { AuthUser } from "@/types/user"

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (user: AuthUser) => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth waa in laga isticmaalaa AuthProvider dhexdiisa")
  }
  return context
}
