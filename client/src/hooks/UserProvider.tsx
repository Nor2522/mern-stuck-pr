import { useState, type ReactNode } from "react"
import type { AuthUser } from "@/types/user"
import { UserContext } from "./useUser"

const USER_KEY = "userData"
const EXPIRY_KEY = "expiretionTime"

const readStoredUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem(USER_KEY)
  const expiry = localStorage.getItem(EXPIRY_KEY)
  if (!storedUser || !expiry) return null

  if (Number(expiry) > Date.now()) {
    return JSON.parse(storedUser) as AuthUser
  }

  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(EXPIRY_KEY)
  return null
}

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)

  const logOut = () => {
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(EXPIRY_KEY)
    setUser(null)
  }

  const login = (userData: AuthUser, expireIn: number) => {
    const expirationTime = Date.now() + expireIn
    localStorage.setItem(EXPIRY_KEY, expirationTime.toString())
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)
  }

  return (
    <UserContext.Provider value={{ user, setUser, login, logOut }}>
      {children}
    </UserContext.Provider>
  )
}

export { UserProvider }
