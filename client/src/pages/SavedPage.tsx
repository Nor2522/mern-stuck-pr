import { Link } from "react-router"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PostCard, PostCardSkeleton } from "@/features/posts/components/PostCard"
import { useBookmarks } from "@/features/posts/api"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const SavedPage = () => {
  useDocumentTitle("Saved")
  const { data, isLoading, isError, refetch } = useBookmarks()

  const posts = data?.posts ?? []
  const total = data?.pagination.total ?? 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold">Saved posts</h1>
        <p className="mt-2 text-muted-foreground">
          {isLoading
            ? "Loading your saved posts…"
            : `${total} post${total === 1 ? "" : "s"} you bookmarked.`}
        </p>
      </header>

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <p className="font-medium">Could not load your saved posts.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Bookmark className="size-6 text-muted-foreground" />
          <p className="font-medium">No saved posts yet</p>
          <p className="text-sm text-muted-foreground">
            Bookmark a post and it will show up here.
          </p>
          <Button
            className="mt-2"
            nativeButton={false}
            render={<Link to="/explore" />}
          >
            Explore posts
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedPage
