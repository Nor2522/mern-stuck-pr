import { useState } from "react"
import { Link } from "react-router"
import { Ellipsis, ExternalLink, Eye, EyeOff, Search } from "lucide-react"
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
import {
  useAdminPosts,
  useDeleteAdminPost,
  useUpdatePostStatus,
  type AdminPostsParams,
} from "@/features/admin/api"
import { FilterSelect } from "@/features/admin/components/FilterSelect"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import type { PostStatus, PostType } from "@/types/post"

const initials = (name: string) => name.trim().charAt(0).toUpperCase() || "?"

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

const AdminPostsPage = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<PostStatus | "all">("all")
  const [sort, setSort] = useState<"newest" | "oldest" | "popular">("newest")

  const debouncedSearch = useDebouncedValue(search, 400)

  const params: AdminPostsParams = {
    page,
    limit: 10,
    sort,
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
    ...(status !== "all" ? { status } : {}),
  }

  const posts = useAdminPosts(params)
  const updateStatus = useUpdatePostStatus()
  const deletePost = useDeleteAdminPost()

  const [deleteTarget, setDeleteTarget] = useState<PostType | null>(null)

  const items = posts.data?.posts ?? []
  const pagination = posts.data?.pagination
  const totalPages = pagination?.totalPages ?? 1

  const resetToFirstPage = () => setPage(1)

  const handleDelete = () => {
    if (!deleteTarget) return
    deletePost.mutate(deleteTarget._id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  return (
    <div>
      <header>
        <h1 className="font-heading text-2xl font-semibold">Posts</h1>
        <p className="mt-1 text-muted-foreground">
          Review every post, including hidden ones.
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
            placeholder="Search title or description"
            className="pl-8"
            aria-label="Search posts"
          />
        </div>
        <FilterSelect
          ariaLabel="Filter by status"
          value={status}
          onChange={(next) => {
            setStatus(next)
            resetToFirstPage()
          }}
          options={[
            { value: "all", label: "All statuses" },
            { value: "published", label: "Published" },
            { value: "hidden", label: "Hidden" },
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
            { value: "popular", label: "Most liked" },
          ]}
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-200 border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Post</th>
              <th className="px-4 py-2.5 font-medium">Author</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Likes</th>
              <th className="px-4 py-2.5 font-medium">Comments</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td colSpan={8} className="px-4 py-3">
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : posts.isError ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <p className="font-medium">Could not load posts.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => posts.refetch()}
                  >
                    Retry
                  </Button>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-16 text-center text-muted-foreground"
                >
                  No posts match your filters.
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const isBusy =
                  updateStatus.isPending &&
                  updateStatus.variables?.id === row._id

                return (
                  <tr
                    key={row._id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="max-w-72 px-4 py-3">
                      <Link
                        to={`/posts/${row._id}`}
                        className="block truncate font-medium transition-colors hover:text-primary"
                        title={row.title}
                      >
                        {row.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          {row.author?.avatar?.url && (
                            <AvatarImage
                              src={row.author.avatar.url}
                              alt={row.author.name}
                            />
                          )}
                          <AvatarFallback>
                            {initials(row.author?.name ?? "Unknown")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                          {row.author?.name ?? "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.category?.name ?? "Uncategorized"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          row.status === "hidden" ? "secondary" : "outline"
                        }
                      >
                        {row.status === "hidden" ? "Hidden" : "Published"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.likesCount}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.commentsCount}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Actions for ${row.title}`}
                              disabled={isBusy}
                            >
                              <Ellipsis />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="min-w-44">
                          <DropdownMenuItem
                            render={
                              <Link to={`/posts/${row._id}`} target="_blank" />
                            }
                          >
                            <ExternalLink />
                            Open public page
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus.mutate({
                                id: row._id,
                                status:
                                  row.status === "hidden"
                                    ? "published"
                                    : "hidden",
                              })
                            }
                          >
                            {row.status === "hidden" ? <Eye /> : <EyeOff />}
                            {row.status === "hidden" ? "Publish" : "Hide"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(row)}
                          >
                            Delete post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && !posts.isLoading && !posts.isError && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || posts.isFetching}
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
            disabled={page >= totalPages || posts.isFetching}
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
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” and all of its likes, comments and
              bookmarks will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deletePost.isPending}
              onClick={(event) => {
                event.preventDefault()
                handleDelete()
              }}
            >
              {deletePost.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AdminPostsPage
