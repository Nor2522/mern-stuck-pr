import axios from "axios"
import { Link, useNavigate, useParams } from "react-router"
import { format, formatDistanceToNow } from "date-fns"
import { ArrowLeft, Bookmark, Heart, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import NotFoundPage from "./NotFoundPage"
import { usePost } from "@/features/posts/api"
import { useAuth } from "@/features/auth/auth-context"
import { getOptimizedImageUrl } from "@/lib/image"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { cn } from "cn"

const initials = (name: string) => name.trim().charAt(0).toUpperCase() || "?"

const PostDetailSkeleton = () => (
  <div className="mx-auto max-w-3xl px-4 py-10">
    <Skeleton className="h-4 w-28" />
    <Skeleton className="mt-6 h-6 w-24" />
    <Skeleton className="mt-3 h-9 w-3/4" />
    <Skeleton className="mt-4 h-10 w-56" />
    <Skeleton className="mt-6 aspect-video w-full rounded-xl" />
    <div className="mt-6 space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
)

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: post, isLoading, isError, error, refetch } = usePost(id)

  const status = axios.isAxiosError(error) ? error.response?.status : undefined
  const isNotFound = isError && status === 404

  useDocumentTitle(
    post ? post.title : isNotFound ? "Post not found" : "Post",
  )

  const handlePending = (label: string) => {
    if (!user) {
      toast.error("Please log in to continue")
      navigate("/login", { state: { from: `/posts/${id}` } })
      return
    }
    toast.info(`${label} are coming in a later step`)
  }

  if (isLoading) return <PostDetailSkeleton />

  if (isNotFound) return <NotFoundPage />

  if (isError || !post) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-24 text-center">
        <p className="font-medium">Could not load this post.</p>
        <p className="text-sm text-muted-foreground">
          Something went wrong. Please try again.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
          <Button variant="ghost" render={<Link to="/explore" />} nativeButton={false}>
            Back to explore
          </Button>
        </div>
      </div>
    )
  }

  const author = post.author
  const authorName = author?.name ?? "Unknown"
  const created = new Date(post.createdAt)

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        render={<Link to="/explore" />}
        nativeButton={false}
      >
        <ArrowLeft />
        Back to explore
      </Button>

      <header className="mt-6">
        {post.category && (
          <Link
            to={`/explore?category=${post.category.slug}`}
            className="inline-block"
          >
            <Badge variant="secondary" className="capitalize">
              {post.category.name}
            </Badge>
          </Link>
        )}
        <h1 className="mt-3 font-heading text-3xl leading-tight font-semibold sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Avatar size="sm">
              {author?.avatar?.url && (
                <AvatarImage src={author.avatar.url} alt={authorName} />
              )}
              <AvatarFallback>{initials(authorName)}</AvatarFallback>
            </Avatar>
            {author ? (
              <Link
                to={`/u/${author._id}`}
                className="font-medium text-foreground hover:underline"
              >
                {authorName}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{authorName}</span>
            )}
          </span>
          <span aria-hidden>·</span>
          <time dateTime={post.createdAt} title={format(created, "PPpp")}>
            {formatDistanceToNow(created, { addSuffix: true })}
          </time>
        </div>
      </header>

      {post.image?.url && (
        <img
          src={getOptimizedImageUrl(post.image.url, 1200)}
          alt={post.title}
          width={1200}
          height={675}
          className="mt-6 aspect-video w-full rounded-xl border object-cover"
        />
      )}

      <div className="mt-6 text-base leading-relaxed whitespace-pre-line text-foreground/90">
        {post.description}
      </div>

      {post.tags.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Badge variant="outline">#{tag}</Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => handlePending("Likes")}>
          <Heart />
          {post.likesCount}
          <span className="sr-only">likes</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePending("Comments")}
        >
          <MessageSquare />
          {post.commentsCount}
          <span className="text-muted-foreground">Comments</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn("ml-auto")}
          onClick={() => handlePending("Bookmarks")}
        >
          <Bookmark />
          Save
        </Button>
      </div>

      <Separator className="my-8" />

      <section className="flex items-center gap-4 rounded-xl border p-4">
        <Avatar>
          {author?.avatar?.url && (
            <AvatarImage src={author.avatar.url} alt={authorName} />
          )}
          <AvatarFallback>{initials(authorName)}</AvatarFallback>
        </Avatar>
        <div>
          {author ? (
            <Link
              to={`/u/${author._id}`}
              className="font-medium hover:underline"
            >
              {authorName}
            </Link>
          ) : (
            <span className="font-medium">{authorName}</span>
          )}
          <p className="text-sm text-muted-foreground">
            Sharing progress with the community
          </p>
        </div>
      </section>
    </article>
  )
}

export default PostDetailPage
