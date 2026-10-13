import { Link, useLocation, useNavigate } from "react-router"
import { ChevronRight } from "lucide-react"
import { useAuth } from "@/features/auth/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const sectionLabels: Record<string, string> = {
  users: "Users",
  posts: "Posts",
  comments: "Comments",
  reports: "Reports",
  categories: "Categories",
}

const initials = (name: string) => name.trim().charAt(0).toUpperCase() || "?"

export const AdminTopbar = () => {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const segment = pathname.split("/").filter(Boolean)[1]
  const current = segment ? (sectionLabels[segment] ?? segment) : "Dashboard"

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link to="/admin" className="transition-colors hover:text-foreground">
          Admin
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{current}</span>
      </nav>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                aria-label="Admin menu"
              >
                <Avatar size="sm">
                  {user.avatar?.url && (
                    <AvatarImage src={user.avatar.url} alt={user.name} />
                  )}
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user.name}</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-52">
            <DropdownMenuLabel>
              <span className="block text-sm font-medium text-foreground">
                {user.name}
              </span>
              <span className="block truncate font-normal">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link to="/" />}>
              Back to site
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link to="/settings" />}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}