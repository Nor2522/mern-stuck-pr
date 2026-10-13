import { useState } from "react"
import { Link } from "react-router"
import { Ellipsis, ExternalLink, Search, Trash2 } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useAdminComments,
  useDeleteAdminComment,
  type AdminCommentsParams,
} from "@/features/admin/api"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import type { AdminComment } from "@/types/admin"

const initials = (name: string) => name.trim().charAt(0).toUpperCase() || "?"

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

const AdminCommentsPage = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")

  const debouncedSearch = useDebouncedValue(search, 400)

  const params: AdminCommentsParams = {
    page,
    limit: 10,
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
  }

  const comments = useAdminComments(params)
  const deleteComment = useDeleteAdminComment()

  const [deleteTarget, setDeleteTarget] = useState<AdminComment | null>(null)

  const items = comments.data?.comments ?? []
  const pagination = comments.data?.pagination
  const totalPages = pagination?.totalPages ?? 1

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteComment.mutate(deleteTarget._id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  return (
    <div>
      <header>
        <h1 className="font-heading text-2xl font-semibold">Comments</h1>
        <p className="mt-1 text-muted-foreground">
          Review the latest comments and remove abusive ones.
        </p>
      </header>

      <div className="mt-6 relative w-full sm:w-64">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Search comments"
          className="pl-8"
          aria-label="Search comments"
        />
      </div>

      <div className="mt-4 rounded-xl border">
        <Table className="min-w-200">
          <TableHeader>
            <TableRow className="bg-muted/50 text-muted-foreground">
              <TableHead className="px-4 font-medium text-muted-foreground">
                Comment
              </TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground">
                Author
              </TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground">
                Post
              </TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="px-4 text-right font-medium text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5} className="px-4 py-3">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : comments.isError ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-16 text-center">
                  <p className="font-medium">Could not load comments.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => comments.refetch()}
                  >
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 py-16 text-center text-muted-foreground"
                >
                  No comments match your filters.
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => {
                const isBusy =
                  deleteComment.isPending &&
                  deleteComment.variables === row._id

                return (
                  <TableRow key={row._id} className="hover:bg-muted/40">
                    <TableCell className="max-w-80 px-4 py-3">
                      <span className="line-clamp-2" title={row.text}>
                        {row.text}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {row.author ? (
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            {row.author.avatar?.url && (
                              <AvatarImage
                                src={row.author.avatar.url}
                                alt={row.author.name}
                              />
                            )}
                            <AvatarFallback>
                              {initials(row.author.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate">{row.author.name}</p>
                            {row.author.email && (
                              <p className="truncate text-xs text-muted-foreground">
                                {row.author.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-64 px-4 py-3">
                      {row.post ? (
                        <Link
                          to={`/posts/${row.post._id}`}
                          className="block truncate text-muted-foreground transition-colors hover:text-primary"
                          title={row.post.title}
                        >
                          {row.post.title}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">
                          Deleted post
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground">
                      {formatDate(row.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Actions for comment"
                              disabled={isBusy}
                            >
                              <Ellipsis />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="min-w-44">
                          {row.post && (
                            <DropdownMenuItem
                              render={
                                <Link
                                  to={`/posts/${row.post._id}`}
                                  target="_blank"
                                />
                              }
                            >
                              <ExternalLink />
                              Open post
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(row)}
                          >
                            <Trash2 />
                            Delete comment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && !comments.isLoading && !comments.isError && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || comments.isFetching}
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
            disabled={page >= totalPages || comments.isFetching}
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
            <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.text}” will be permanently removed. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteComment.isPending}
              onClick={(event) => {
                event.preventDefault()
                handleDelete()
              }}
            >
              {deleteComment.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AdminCommentsPage
