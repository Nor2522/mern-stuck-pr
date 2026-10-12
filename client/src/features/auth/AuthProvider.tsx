import type { ReactNode } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AuthContext, type AuthContextValue } from "./auth-context"
import { getMe, meQueryKey, signOut } from "./api"
import type { AuthUser } from "@/types/user"

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: meQueryKey,
    queryFn: getMe,
    retry: false,
  })

  const login = (user: AuthUser) => {
    queryClient.setQueryData(meQueryKey, user)
  }

  const logout = async () => {
    try {
      await signOut()
    } finally {
      queryClient.clear()
    }
  }

  const value: AuthContextValue = {
    user: data ?? null,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
