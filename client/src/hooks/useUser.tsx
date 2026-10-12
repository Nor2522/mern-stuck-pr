import { createContext, useContext } from "react"
import type { AuthUser } from "@/types/user"

export interface UserContextValue {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  login: (user: AuthUser, expireIn: number) => void
  logOut: () => void
}

export const UserContext = createContext<UserContextValue | null>(null)

const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser waa in laga isticmaalaa UserProvider dhexdiisa")
  }
  return context
}

export default useUser
