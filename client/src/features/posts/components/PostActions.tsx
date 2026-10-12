import { Link, useNavigate } from "react-router"
import { Bookmark, Heart, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/auth-context"
import { useToggleBookmark, useToggleLike } from "@/features/posts/api"
import { ShareMenu } from "./ShareMenu"
import type { PostType } from "@/types/post"
import { cn } from "cn"

export const PostActions = ({
  post,
  full = false,
}: {
  post: PostType
  full?: boolean
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toggleLike = useToggleLike(post._id)
  const toggleBookmark = useToggleBookmark(post._id)

  const requireLogin = () => {
    toast.error("Please log in to continue")
    navigate("/login", { state: { from: `/posts/${post._id}` } })
  }

  const onLike = () => (user ? toggleLike.mutate() : requireLogin())
  const onSave = () => (user ? toggleBookmark.mutate() : requireLogin())

  const size = full ? "sm" : "xs"
  const variant = full ? "outline" : "ghost"

  return (
    <div
      className={cn(
        "flex items-center",
        full ? "flex-wrap gap-2" : "gap-0.5",
      )}
    >
      <Button
        variant={variant}
        size={size}
        onClick={onLike}
        aria-pressed={post.likedByMe}
        aria-label="Like post"
      >
        <Heart
          className={cn(post.likedByMe && "fill-destructive text-destructive")}
        />
        <span className="ml-1 text-xs tabular-nums">{post.likesCount}</span>
        {full && <span>Like</span>}
      </Button>

      <Button
        variant={variant}
        size={size}
        nativeButton={false}
        render={<Link to={`/posts/${post._id}#comments`} />}
        aria-label="View comments"
      >
        <MessageSquare />
        <span className="ml-1 text-xs tabular-nums">{post.commentsCount}</span>
        {full && <span>Comment</span>}
      </Button>

      <Button
        variant={variant}
        size={size}
        onClick={onSave}
        aria-pressed={post.bookmarkedByMe}
        aria-label="Save post"
      >
        <Bookmark
          className={cn(
            post.bookmarkedByMe && "fill-primary text-primary",
          )}
        />
        {full && <span>Save</span>}
      </Button>

      <ShareMenu postId={post._id} title={post.title} size={size} />
    </div>
  )
}
