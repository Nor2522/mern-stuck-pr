import { useState } from "react"
import { useParams } from "react-router"
import { format } from "date-fns"
import { isAxiosError } from "axios"
import { AlertTriangle, FileQuestion, UserRound } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { PostCard, PostCardSkeleton } from "@/features/posts/components/PostCard"
import { usePosts } from "@/features/posts/api"
import { useProfile } from "@/features/profile/api"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { Link } from "react-router"

const PROFILE_PAGE_SIZE = 9

const initials = (name: string) => name.trim().charAt(0).toUpperCase()

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>()
  const [page, setPage] = useState(1)

  const profileQuery = useProfile(id)
  const profile = profileQuery.data

  const postsQuery = usePosts({ author: id, page, limit: PROFILE_PAGE_SIZE })

  useDocumentTitle(profile?.name ?? "Profile")

  if (!id) return <ProfileUnavailable />

  if (profileQuery.isError) {
    const status = isAxiosError(profileQuery.error)
      ? profileQuery.error.response?.status
      : undefined
    if (status === 404) return <ProfileUnavailable />
    return (
      <ProfileError onRetry={() => profileQuery.refetch()} />
    )
  }

  if (profileQuery.isLoading) return <ProfileSkeleton />

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-start gap-5 pt-6 sm:flex-row sm:items-center">
          <Avatar className="size-24">
            {profile?.avatar?.url && (
              <AvatarImage src={profile.avatar.url} alt={profile.name} />
            )}
            <AvatarFallback className="text-3xl">
              {initials(profile?.name ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-2">
            <h1 className="truncate font-heading text-2xl font-semibold">
              {profile?.name}
            </h1>
            {profile?.bio ? (
              <p className="max-w-2xl whitespace-pre-line text-muted-foreground">
                {profile.bio}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {profile && (
                <span>
                  Joined{" "}
                  {format(new Date(profile.createdAt), "MMMM yyyy")}
                </span>
              )}
              <Badge variant="secondary">
                {postsQuery.data?.pagination.total ?? 0} posts
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="mt-10">
        <h2 className="font-heading text-xl font-semibold">Posts</h2>
        {postsQuery.isLoading ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </div>
        ) : postsQuery.isError ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
            <p className="font-medium">Could not load this user's posts.</p>
            <Button variant="outline" onClick={() => postsQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : postsQuery.data?.posts.length ? (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {postsQuery.data.posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            {postsQuery.data.pagination.totalPages > 1 && (
              <Pagination className="mt-10">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      to={`/u/${id}?page=${page - 1}`}
                      isActive={false}
                      aria-disabled={page <= 1}
                      onClick={(event) => {
                        if (page > 1) setPage(page - 1)
                        else event.preventDefault()
                      }}
                    />
                  </PaginationItem>
                  {Array.from({
                    length: postsQuery.data.pagination.totalPages,
                  }).map((_, index) => {
                    const number = index + 1
                    return (
                      <PaginationItem key={number}>
                        <PaginationLink
                          to={`/u/${id}?page=${number}`}
                          isActive={page === number}
                          onClick={() => setPage(number)}
                        >
                          {number}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem>
                    <PaginationNext
                      to={`/u/${id}?page=${page + 1}`}
                      aria-disabled={
                        page >= postsQuery.data.pagination.totalPages
                      }
                      onClick={(event) => {
                        if (page < postsQuery.data.pagination.totalPages)
                          setPage(page + 1)
                        else event.preventDefault()
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3 py-16 text-center">
            <UserRound className="size-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              This user has not published any posts yet.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

const ProfileSkeleton = () => (
  <div className="mx-auto max-w-6xl px-4 py-12">
    <Card>
      <CardContent className="flex items-center gap-5 pt-6">
        <Skeleton className="size-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </CardContent>
    </Card>
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  </div>
)

const ProfileUnavailable = () => (
  <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-24 text-center">
    <FileQuestion className="size-8 text-muted-foreground" />
    <h1 className="font-heading text-2xl font-semibold">Profile not found</h1>
    <p className="text-muted-foreground">
      This user does not exist or has been removed.
    </p>
    <Button
      className="mt-2"
      render={<Link to="/" />}
      nativeButton={false}
    >
      Back home
    </Button>
  </div>
)

const ProfileError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-24 text-center">
    <AlertTriangle className="size-8 text-muted-foreground" />
    <h1 className="font-heading text-2xl font-semibold">
      Could not load this profile
    </h1>
    <p className="text-muted-foreground">
      Something went wrong. Please try again.
    </p>
    <Button className="mt-2" variant="outline" onClick={onRetry}>
      Retry
    </Button>
  </div>
)

export default ProfilePage