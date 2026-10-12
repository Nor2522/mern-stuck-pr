import { Link } from "react-router"
import { PenLine, Sparkles, TrendingUp } from "lucide-react"
import { useAuth } from "@/features/auth/auth-context"
import { useCategories } from "@/features/categories/api"
import { useLatestPosts } from "@/features/posts/api"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import {
  PostCard,
  PostCardSkeleton,
} from "@/features/posts/components/PostCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const steps = [
  {
    icon: PenLine,
    title: "Share your progress",
    description: "Post your wins, your lessons, and the days you got stuck.",
  },
  {
    icon: TrendingUp,
    title: "Get motivated",
    description: "Read stories from developers who are in the same boat.",
  },
  {
    icon: Sparkles,
    title: "Build momentum",
    description: "Make sharing progress a habit and keep shipping.",
  },
]

const HomePage = () => {
  useDocumentTitle()
  const { user } = useAuth()
  const latest = useLatestPosts(6)
  const categories = useCategories()
  const primaryTo = user ? "/dashboard" : "/register"
  const primaryLabel = user ? "Go to dashboard" : "Join the community"

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-16 text-center sm:py-24">
        <h1 className="mx-auto max-w-3xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Programmers helping each other stay motivated
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          A community of programmers sharing what they build, learn and
          struggle with, so nobody ships alone.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link to={primaryTo} />}
          >
            {primaryLabel}
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link to="/explore" />}>
            Browse posts
          </Button>
        </div>
      </section>

      <section className="py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold">
              Latest posts
            </h2>
            <p className="text-sm text-muted-foreground">
              Fresh progress from the community
            </p>
          </div>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/explore" />}>
            View all
          </Button>
        </div>

        {latest.isLoading && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </div>
        )}

        {latest.isError && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
            <p className="font-medium">Could not load posts</p>
            <p className="text-sm text-muted-foreground">
              Something went wrong on our side. Try again.
            </p>
            <Button
              variant="outline"
              onClick={() => void latest.refetch()}
              disabled={latest.isFetching}
            >
              Retry
            </Button>
          </div>
        )}

        {latest.isSuccess && latest.data.posts.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
            <p className="font-medium">No posts yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to share your progress.
            </p>
            <Button variant="outline" nativeButton={false} render={<Link to={primaryTo} />}>
              {primaryLabel}
            </Button>
          </div>
        )}

        {latest.isSuccess && latest.data.posts.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.data.posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="py-8">
        <h2 className="font-heading text-2xl font-semibold">
          Browse by topic
        </h2>

        {categories.isLoading && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-20" />
            ))}
          </div>
        )}

        {categories.isError && (
          <div className="mt-4 flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Categories could not be loaded.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void categories.refetch()}
              disabled={categories.isFetching}
            >
              Retry
            </Button>
          </div>
        )}

        {categories.isSuccess && categories.data.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            No categories yet. Check back soon.
          </p>
        )}

        {categories.isSuccess && categories.data.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.data.map((category) => (
              <Badge
                key={category._id}
                variant="outline"
                className="capitalize hover:bg-muted"
                render={<Link to={`/explore?category=${category.slug}`} />}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        )}
      </section>

      <section className="py-8">
        <h2 className="font-heading text-2xl font-semibold">How it works</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-xl border p-6">
              <step.icon className="size-6 text-primary" />
              <h3 className="mt-4 font-heading font-medium">
                {index + 1}. {step.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8 pb-16">
        <div className="rounded-2xl border bg-muted/40 p-10 text-center">
          <h2 className="font-heading text-2xl font-semibold">
            Ready to share your progress?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Your next post could be the one that keeps someone going.
          </p>
          <div className="mt-6">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link to={primaryTo} />}
            >
              {primaryLabel}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage