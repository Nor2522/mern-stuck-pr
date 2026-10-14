import { useState } from "react"
import { Link } from "react-router"
import {
  Check,
  Ellipsis,
  ExternalLink,
  EyeOff,
  X,
} from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useAdminReports,
  useDeleteAdminPost,
  useUpdatePostStatus,
  useUpdateReportStatus,
  type AdminReportsParams,
} from "@/features/admin/api"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import type {
  ReportPostRef,
  ReportReason,
  ReportStatus,
} from "@/types/admin"

const TABS: { value: ReportStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
]

const REASON_LABELS: Record<ReportReason, string> = {
  spam: "Spam",
  harassment: "Harassment",
  misleading: "Misleading",
  inappropriate: "Inappropriate",
  other: "Other",
}

const initials = (name: string) => name.trim().charAt(0).toUpperCase() || "?"

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

const AdminReportsPage = () => {
  useDocumentTitle("Reports")
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<ReportStatus>("open")

  const params: AdminReportsParams = { page, limit: 10, status }

  const reports = useAdminReports(params)
  const updateReport = useUpdateReportStatus()
  const updateStatus = useUpdatePostStatus()
  const deletePost = useDeleteAdminPost()

  const [deleteTarget, setDeleteTarget] = useState<ReportPostRef | null>(null)

  const items = reports.data?.reports ?? []
  const pagination = reports.data?.pagination
  const totalPages = pagination?.totalPages ?? 1

  const handleDelete = () => {
    if (!deleteTarget) return
    deletePost.mutate(deleteTarget._id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  return (
    <div>
      <header>
        <h1 className="font-heading text-2xl font-semibold">Reports</h1>
        <p className="mt-1 text-muted-foreground">
          Review reported posts and resolve or dismiss each report.
        </p>
      </header>

      <Tabs
        value={status}
        onValueChange={(value) => {
          setStatus(value as ReportStatus)
          setPage(1)
        }}
        className="mt-6"
      >
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4 rounded-xl border">
        <Table className="min-w-200">
          <TableHeader>
            <TableRow className="bg-muted/50 text-muted-foreground">
              <TableHead className="px-4 font-medium text-muted-foreground">
                Post
              </TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground">
                Reporter
              </TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground">
                Reason
              </TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground">
                Details
              </TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground">
                Reported
              </TableHead>
              <TableHead className="px-4 text-right font-medium text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6} className="px-4 py-3">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : reports.isError ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-16 text-center">
                  <p className="font-medium">Could not load reports.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => reports.refetch()}
                  >
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-4 py-16 text-center text-muted-foreground"
                >
                  No {status} reports.
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => {
                const isBusy =
                  (updateReport.isPending &&
                    updateReport.variables?.id === row._id) ||
                  (deletePost.isPending &&
                    deletePost.variables === row.post?._id)

                return (
                  <TableRow key={row._id} className="hover:bg-muted/40">
                    <TableCell className="max-w-64 px-4 py-3">
                      {row.post ? (
                        <Link
                          to={`/posts/${row.post._id}`}
                          className="block truncate font-medium transition-colors hover:text-primary"
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
                    <TableCell className="px-4 py-3">
                      {row.reporter ? (
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            {row.reporter.avatar?.url && (
                              <AvatarImage
                                src={row.reporter.avatar.url}
                                alt={row.reporter.name}
                              />
                            )}
                            <AvatarFallback>
                              {initials(row.reporter.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate">{row.reporter.name}</p>
                            {row.reporter.email && (
                              <p className="truncate text-xs text-muted-foreground">
                                {row.reporter.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant="outline">{REASON_LABELS[row.reason]}</Badge>
                    </TableCell>
                    <TableCell className="max-w-64 px-4 py-3 text-muted-foreground">
                      {row.details ? (
                        <span className="line-clamp-2" title={row.details}>
                          {row.details}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground">
                      <p>{formatDate(row.createdAt)}</p>
                      {row.status !== "open" && row.resolvedAt && (
                        <p className="text-xs">
                          {row.status === "resolved" ? "Resolved" : "Dismissed"}
                          {row.resolvedBy?.name
                            ? ` by ${row.resolvedBy.name}`
                            : ""}{" "}
                          · {formatDate(row.resolvedAt)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Actions for report on ${
                                row.post?.title ?? "post"
                              }`}
                              disabled={isBusy}
                            >
                              <Ellipsis />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="min-w-44">
                          {row.status === "open" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateReport.mutate({
                                    id: row._id,
                                    status: "resolved",
                                  })
                                }
                              >
                                <Check />
                                Resolve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateReport.mutate({
                                    id: row._id,
                                    status: "dismissed",
                                  })
                                }
                              >
                                <X />
                                Dismiss
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {row.post && (
                            <>
                              {row.post.status === "published" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    row.post &&
                                    updateStatus.mutate({
                                      id: row.post._id,
                                      status: "hidden",
                                    })
                                  }
                                >
                                  <EyeOff />
                                  Hide post
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                render={
                                  <Link
                                    to={`/posts/${row.post._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  />
                                }
                              >
                                <ExternalLink />
                                Open public page
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTarget(row.post ?? null)}
                              >
                                Delete post
                              </DropdownMenuItem>
                            </>
                          )}
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

      {totalPages > 1 && !reports.isLoading && !reports.isError && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || reports.isFetching}
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
            disabled={page >= totalPages || reports.isFetching}
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
              “{deleteTarget?.title}” and all of its likes, comments, bookmarks
              and reports will be permanently removed. This cannot be undone.
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

export default AdminReportsPage
