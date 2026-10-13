import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "./auth-context"
import type { UserRole } from "@/types/user"

const LoadingScreen = () => (
  <div className="mx-auto max-w-6xl px-4 py-12">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="mt-4 h-4 w-72" />
  </div>
)

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingScreen />
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

export const GuestRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingScreen />
  if (user) {
    // When logged in, redirect to the page the user came from if it exists.
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? "/"} replace />
  }
  return <>{children}</>
}

export const RoleRoute = ({
  role,
  children,
}: {
  role: UserRole
  children: ReactNode
}) => {
  const { user, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/" replace />
  return <>{children}</>
}
