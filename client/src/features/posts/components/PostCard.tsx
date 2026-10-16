import { Link } from "react-router"
import { formatDistanceToNow } from "date-fns"
import { Code2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PostActions } from "./PostActions"
import { getOptimizedImageUrl } from "@/lib/image"
import type { PostType } from "@/types/post"

const timeAgo = (value: string | undefined) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return formatDistanceToNow(date, { addSuffix: true })
}

const initials = (name: string) => name.trim().charAt(0).toUpperCase() || "?"

export const PostCard = ({ post }: { post: PostType }) => {
  const author = post.author
  const authorName = author?.name ?? "Unknown"
  const dateLabel = timeAgo(post.createdAt)

  return (
    <Card className="h-full overflow-hidden border-black/10 shadow-sm hover:border-primary hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_35%,transparent),0_8px_30px_-12px_color-mix(in_oklab,var(--primary)_45%,transparent)] dark:border-white/20">
      <Link
        to={`/posts/${post._id}`}
        className="group/link flex flex-col gap-(--card-spacing)"
        aria-label={post.title}
      >
        {post.image?.url ? (
          <img
            src={getOptimizedImageUrl(post.image.url)}
            alt={post.title}
            loading="lazy"
            width={800}
            height={450}
            className="aspect-video w-full rounded-t-xl object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-t-xl bg-muted">
            <Code2 className="size-8 text-muted-foreground" />
          </div>
        )}
        <CardContent className="flex flex-col gap-1.5">
          {post.category ? (
            <Badge variant="default" className="w-fit capitalize">
              {post.category.name}
            </Badge>
          ) : (
            <div className="h-5" />
          )}
          <h3 className="line-clamp-1 font-heading text-base font-bold tracking-tight transition-colors group-hover/link:text-primary">
            {post.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {post.description}
          </p>
        </CardContent>
      </Link>

      <div className="flex items-center gap-2 px-(--card-spacing) text-xs text-muted-foreground">
        <Avatar size="sm">
          {author?.avatar?.url && (
            <AvatarImage src={author.avatar.url} alt={authorName} />
          )}
          <AvatarFallback>{initials(authorName)}</AvatarFallback>
        </Avatar>
        <span className="truncate font-medium text-foreground">
          {authorName}
        </span>
        {dateLabel && <time className="whitespace-nowrap">{dateLabel}</time>}
        <div className="ml-auto">
          <PostActions post={post} />
        </div>
      </div>
    </Card>
  )
}

export const PostCardSkeleton = () => (
  <Card className="overflow-hidden border-black/10 shadow-sm dark:border-white/20">
    <Skeleton className="aspect-video w-full rounded-none" />
    <CardContent className="space-y-2 pt-4">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-3 h-5 w-1/2" />
    </CardContent>
  </Card>
)
