import { useState } from "react"
import { FileText, Heart, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MyPostCard } from "@/features/posts/components/MyPostCard"
import { NewPostDialog } from "@/features/posts/components/NewPostDialog"
import { PostCardSkeleton } from "@/features/posts/components/PostCard"
import { useMyPosts, useMyStats } from "@/features/posts/api"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const StatCard = ({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string
  value?: number
  icon: typeof FileText
  loading: boolean
}) => (
  <Card>
    <CardContent className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-10" />
        ) : (
          <p className="font-heading text-xl font-semibold">{value ?? 0}</p>
        )}
      </div>
    </CardContent>
  </Card>
)

const DashBoard = () => {
  useDocumentTitle("Dashboard")
  const [page, setPage] = useState(1)
  const posts = useMyPosts(page)
  const stats = useMyStats()

  const items = posts.data?.posts ?? []
  const pagination = posts.data?.pagination
  const totalPages = pagination?.totalPages ?? 1

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Maamul post-yadaada oo abuur mid cusub.
          </p>
        </div>
        <NewPostDialog />
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="My posts"
          value={stats.data?.totalPosts}
          icon={FileText}
          loading={stats.isLoading}
        />
        <StatCard
          label="Total likes"
          value={stats.data?.totalLikes}
          icon={Heart}
          loading={stats.isLoading}
        />
        <StatCard
          label="Total comments"
          value={stats.data?.totalComments}
          icon={MessageSquare}
          loading={stats.isLoading}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">My posts</h2>

        {posts.isLoading ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </div>
        ) : posts.isError ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
            <p className="font-medium">Could not load your posts.</p>
            <Button variant="outline" onClick={() => posts.refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
            <p className="font-medium">Weli post ma jiro</p>
            <p className="text-sm text-muted-foreground">
              Abuur post-kaagii ugu horreeya.
            </p>
            <NewPostDialog />
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((post) => (
                <MyPostCard key={post._id} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || posts.isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Bog {page} / {totalPages}
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
          </>
        )}
      </section>
    </div>
  )
}

export default DashBoard
