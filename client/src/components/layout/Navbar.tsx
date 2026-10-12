import { Link, useNavigate } from "react-router"
import { Code2, Menu } from "lucide-react"
import { useAuth } from "@/features/auth/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { ModeToggle } from "@/components/mode-toggle"
import type { AuthUser } from "@/types/user"

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
]

const initials = (name: string) => name.trim().charAt(0).toUpperCase() || "?"

const UserLinks = ({ user }: { user: AuthUser }) => (
  <>
    <DropdownMenuItem render={<Link to={`/u/${user._id}`} />}>
      Profile
    </DropdownMenuItem>
    <DropdownMenuItem render={<Link to="/dashboard" />}>
      My posts
    </DropdownMenuItem>
    <DropdownMenuItem render={<Link to="/saved" />}>Saved</DropdownMenuItem>
    {user.role === "admin" && (
      <DropdownMenuItem render={<Link to="/admin" />}>Admin</DropdownMenuItem>
    )}
  </>
)

export const Navbar = () => {
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-heading text-base font-semibold"
        >
          <Code2 className="size-5 text-primary" />
          DevMotiv
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Button
              key={link.to}
              variant="ghost"
              size="sm"
              render={<Link to={link.to} />}
            >
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ModeToggle />
          {isLoading ? (
            <Skeleton className="size-8 rounded-full" />
          ) : user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      aria-label="User menu"
                    >
                      <Avatar size="sm">
                        {user.avatar?.url && (
                          <AvatarImage src={user.avatar.url} alt={user.name} />
                        )}
                        <AvatarFallback>{initials(user.name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="min-w-52">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <span className="block text-sm font-medium text-foreground">
                        {user.name}
                      </span>
                      <span className="block truncate font-normal">
                        {user.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <UserLinks user={user} />
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      aria-label="Open menu"
                    >
                      <Menu />
                    </Button>
                  }
                />
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-1 px-4">
                    {navLinks.map((link) => (
                      <SheetClose
                        key={link.to}
                        render={
                          <Button
                            variant="ghost"
                            className="justify-start"
                            render={<Link to={link.to} />}
                          />
                        }
                      >
                        {link.label}
                      </SheetClose>
                    ))}
                    <SheetClose
                      render={
                        <Button
                          variant="ghost"
                          className="justify-start text-destructive"
                          onClick={handleLogout}
                        />
                      }
                    >
                      Logout
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      aria-label="Open menu"
                    >
                      <Menu />
                    </Button>
                  }
                />
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-1 px-4">
                    {navLinks.map((link) => (
                      <SheetClose
                        key={link.to}
                        render={
                          <Button
                            variant="ghost"
                            className="justify-start"
                            render={<Link to={link.to} />}
                          />
                        }
                      >
                        {link.label}
                      </SheetClose>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
              <Button
                variant="ghost"
                size="sm"
                render={<Link to="/login" />}
              >
                Login
              </Button>
              <Button size="sm" render={<Link to="/register" />}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
