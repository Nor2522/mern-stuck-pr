import { useState } from "react"
import { Ellipsis, Search, ShieldCheck, UserX } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/features/auth/auth-context"
import {
  useAdminUsers,
  useDeleteUser,
  useUpdateUserBan,
  useUpdateUserRole,
  type AdminUsersParams,
} from "@/features/admin/api"
import { FilterSelect } from "@/features/admin/components/FilterSelect"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import type { AdminUser } from "@/types/admin"
import type { UserRole } from "@/types/user"

const initials = (name: string) => name.trim().charAt(0).toUpperCase() || "?"

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState<UserRole | "all">("all")
  const [status, setStatus] = useState<"all" | "active" | "banned">("all")
  const [sort, setSort] = useState<"newest" | "oldest">("newest")

  const debouncedSearch = useDebouncedValue(search, 400)

  const params: AdminUsersParams = {
    page,
    limit: 10,
    sort,
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
    ...(role !== "all" ? { role } : {}),
    ...(status !== "all" ? { status } : {}),
  }

  const users = useAdminUsers(params)
  const updateRole = useUpdateUserRole()
  const updateBan = useUpdateUserBan()
  const deleteUser = useDeleteUser()

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  const items = users.data?.users ?? []
  const pagination = users.data?.pagination
  const totalPages = pagination?.totalPages ?? 1

  const resetToFirstPage = () => setPage(1)

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteUser.mutate(deleteTarget._id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  return (
    <div>
      <header>
        <h1 className="font-heading text-2xl font-semibold">Users</h1>
        <p className="mt-1 text-muted-foreground">
          Manage accounts, roles and suspensions.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              resetToFirstPage()
            }}
            placeholder="Search name or email"
            className="pl-8"
            aria-label="Search users"
          />
        </div>
        <FilterSelect
          ariaLabel="Filter by role"
          value={role}
          onChange={(next) => {
            setRole(next)
            resetToFirstPage()
          }}
          options={[
            { value: "all", label: "All roles" },
            { value: "user", label: "Users" },
            { value: "admin", label: "Admins" },
          ]}
        />
        <FilterSelect
          ariaLabel="Filter by status"
          value={status}
          onChange={(next) => {
            setStatus(next)
            resetToFirstPage()
          }}
          options={[
            { value: "all", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "banned", label: "Suspended" },
          ]}
        />
        <FilterSelect
          ariaLabel="Sort order"
          value={sort}
          onChange={(next) => {
            setSort(next)
            resetToFirstPage()
          }}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
          ]}
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-160 border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Posts</th>
              <th className="px-4 py-2.5 font-medium">Joined</th>
              <th className="px-4 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td colSpan={6} className="px-4 py-3">
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : users.isError ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="font-medium">Could not load users.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => users.refetch()}
                  >
                    Retry
                  </Button>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-16 text-center text-muted-foreground"
                >
                  No users match your filters.
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const isSelf = currentUser?._id === row._id
                const isBusy =
                  (updateRole.isPending &&
                    updateRole.variables?.id === row._id) ||
                  (updateBan.isPending && updateBan.variables?.id === row._id)

                return (
                  <tr
                    key={row._id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          {row.avatar?.url && (
                            <AvatarImage
                              src={row.avatar.url}
                              alt={row.name}
                            />
                          )}
                          <AvatarFallback>{initials(row.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {row.name}
                            {isSelf && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {row.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={row.role === "admin" ? "default" : "secondary"}
                      >
                        {row.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={row.isBanned ? "destructive" : "outline"}
                      >
                        {row.isBanned ? "Suspended" : "Active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.postsCount}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isSelf ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Actions for ${row.name}`}
                                disabled={isBusy}
                              >
                                <Ellipsis />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="min-w-44">
                            <DropdownMenuItem
                              onClick={() =>
                                updateRole.mutate({
                                  id: row._id,
                                  role: row.role === "admin" ? "user" : "admin",
                                })
                              }
                            >
                              <ShieldCheck />
                              {row.role === "admin"
                                ? "Demote to user"
                                : "Promote to admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateBan.mutate({
                                  id: row._id,
                                  isBanned: !row.isBanned,
                                })
                              }
                            >
                              <UserX />
                              {row.isBanned ? "Unsuspend" : "Suspend"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(row)}
                            >
                              Delete user
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && !users.isLoading && !users.isError && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || users.isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || users.isFetching}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          >
            Next
          </Button>
        </div>
      )}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} and all of their posts, likes, comments and
              bookmarks will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteUser.isPending}
              onClick={(event) => {
                event.preventDefault()
                handleDelete()
              }}
            >
              {deleteUser.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AdminUsersPage