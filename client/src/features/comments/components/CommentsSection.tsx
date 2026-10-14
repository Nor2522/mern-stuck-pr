import { useState } from "react"
import { Link } from "react-router"
import { formatDistanceToNow } from "date-fns"
import { Send, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/features/auth/auth-context"
import {
  useAddComment,
  useComments,
  useDeleteComment,
} from "@/features/comments/api"
import type { CommentType } from "@/types/comment"

const MAX_LENGTH = 500

const initials = (name: string) => name.trim().charAt(0).toUpperCase() || "?"

const timeAgo = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return formatDistanceToNow(date, { addSuffix: true })
}

const CommentItem = ({
  comment,
  canDelete,
  onDelete,
}: {
  comment: CommentType
  canDelete: boolean
  onDelete: () => void
}) => {
  const author = comment.author
  const authorName = author?.name ?? "Unknown"

  return (
    <li className="flex gap-3 py-4">
      <Avatar size="sm">
        {author?.avatar?.url && (
          <AvatarImage src={author.avatar.url} alt={authorName} />
        )}
        <AvatarFallback>{initials(authorName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {author ? (
            <Link
              to={`/u/${author._id}`}
              className="text-sm font-medium hover:underline"
            >
              {authorName}
            </Link>
          ) : (
            <span className="text-sm font-medium">{authorName}</span>
          )}
          <time className="text-xs text-muted-foreground">
            {timeAgo(comment.createdAt)}
          </time>
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="ml-auto text-muted-foreground"
                    aria-label="Delete comment"
                  />
                }
              >
                <Trash2 />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                    onClick={onDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <p className="mt-1 text-sm break-words whitespace-pre-line">
          {comment.text}
        </p>
      </div>
    </li>
  )
}

export const CommentsSection = ({
  postId,
  commentsCount,
}: {
  postId: string
  commentsCount: number
}) => {
  const { user } = useAuth()
  const query = useComments(postId)
  const addComment = useAddComment(postId)
  const deleteComment = useDeleteComment(postId)
  const [text, setText] = useState("")

  const comments = query.data?.pages.flatMap((page) => page.comments) ?? []
  const total = query.data?.pages[0]?.pagination.total ?? commentsCount
  const trimmed = text.trim()
  const tooLong = trimmed.length > MAX_LENGTH

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!user || trimmed.length === 0 || tooLong) return
    addComment.mutate(trimmed, { onSuccess: () => setText("") })
  }

  return (
    <section id="comments" className="scroll-mt-20">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-xl font-semibold">Comments</h2>
        <span className="text-sm text-muted-foreground">{total}</span>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mt-4">
          <Textarea
            id="comment-body"
            name="comment"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Share what you think…"
            aria-label="Write a comment"
            maxLength={MAX_LENGTH + 50}
            rows={3}
          />
          <div className="mt-2 flex items-center justify-between">
            <span
              className={
                tooLong
                  ? "text-xs text-destructive"
                  : "text-xs text-muted-foreground"
              }
            >
              {trimmed.length}/{MAX_LENGTH}
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={trimmed.length === 0 || tooLong || addComment.isPending}
            >
              <Send />
              {addComment.isPending ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Log in to join the conversation.
          </p>
          <div className="flex gap-2">
            <Button size="sm" nativeButton={false} render={<Link to="/login" />}>
              Login
            </Button>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link to="/register" />}
            >
              Register
            </Button>
          </div>
        </div>
      )}

      <Separator className="my-4" />

      {query.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Could not load comments.
          </p>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Retry
          </Button>
        </div>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <>
          <ul className="divide-y">
            {comments.map((comment) => {
              const canDelete =
                Boolean(user) &&
                (user?._id === comment.author?._id || user?.role === "admin")
              return (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  canDelete={canDelete}
                  onDelete={() => deleteComment.mutate(comment._id)}
                />
              )
            })}
          </ul>
          {query.hasNextPage && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
              >
                {query.isFetchingNextPage ? "Loading…" : "Load more comments"}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
