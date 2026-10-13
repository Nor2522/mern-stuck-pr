import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { Search, SearchX, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  PostCard,
  PostCardSkeleton,
} from "@/features/posts/components/PostCard"
import { usePosts } from "@/features/posts/api"
import { useCategories } from "@/features/categories/api"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { cn } from "cn"

const PAGE_SIZE = 9

const pageList = (page: number, totalPages: number) => {
  const pages: (number | "ellipsis")[] = []
  if (totalPages <= 1) return pages

  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  pages.push(1)
  if (start > 2) pages.push("ellipsis")
  for (let p = start; p <= end; p += 1) pages.push(p)
  if (end < totalPages - 1) pages.push("ellipsis")
  pages.push(totalPages)

  return pages
}

const ExplorePage = () => {
  useDocumentTitle("Explore")

  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get("q") ?? ""
  const category = searchParams.get("category") ?? ""
  const sort: "latest" | "popular" =
    searchParams.get("sort") === "popular" ? "popular" : "latest"
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1)

  const [searchInput, setSearchInput] = useState(q)
  const [prevQ, setPrevQ] = useState(q)
  const debouncedSearch = useDebouncedValue(searchInput, 400)

  // URL -> input (back/forward, direct links): adjust state during render
  // instead of in an effect (react-hooks/set-state-in-effect).
  if (q !== prevQ) {
    setPrevQ(q)
    setSearchInput(q)
  }

  // input -> URL, debounced
  useEffect(() => {
    const trimmed = debouncedSearch.trim()
    if (trimmed === q) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (trimmed) next.set("q", trimmed)
        else next.delete("q")
        next.delete("page")
        return next
      },
      { replace: true },
    )
  }, [debouncedSearch, q, setSearchParams])

  const updateFilter = (key: string, value?: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete("page")
      return next
    })
  }

  const goToPage = (target: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (target <= 1) next.delete("page")
      else next.set("page", String(target))
      return next
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const pageHref = (target: number) => {
    const next = new URLSearchParams(searchParams)
    if (target <= 1) next.delete("page")
    else next.set("page", String(target))
    const query = next.toString()
    return query ? `/explore?${query}` : "/explore"
  }

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      q: q || undefined,
      category: category || undefined,
      sort,
    }),
    [page, q, category, sort],
  )

  const { data, isLoading, isError, isPlaceholderData, refetch } =
    usePosts(params)
  const { data: categories } = useCategories()

  const posts = data?.posts ?? []
  const totalPages = data?.pagination.totalPages ?? 0
  const total = data?.pagination.total ?? 0
  const hasFilters = Boolean(q || category || sort === "popular")

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold">Explore posts</h1>
        <p className="mt-2 text-muted-foreground">
          Search progress updates, lessons and wins shared by the community.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-4">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by title or description"
            aria-label="Search posts"
            className="pl-9"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("")
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev)
                  next.delete("q")
                  next.delete("page")
                  return next
                })
              }}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 flex -translate-y-1/2 cursor-pointer items-center rounded-md p-1 text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={category ? "outline" : "default"}
            onClick={() => updateFilter("category", undefined)}
          >
            All topics
          </Button>
          {categories?.map((item) => (
            <Button
              key={item._id}
              type="button"
              size="sm"
              variant={category === item.slug ? "default" : "outline"}
              onClick={() =>
                updateFilter(
                  "category",
                  category === item.slug ? undefined : item.slug,
                )
              }
            >
              {item.name}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort</span>
          <div className="inline-flex rounded-lg border p-0.5">
            <Button
              type="button"
              size="sm"
              variant={sort === "latest" ? "secondary" : "ghost"}
              onClick={() => updateFilter("sort", undefined)}
            >
              Latest
            </Button>
            <Button
              type="button"
              size="sm"
              variant={sort === "popular" ? "secondary" : "ghost"}
              onClick={() => updateFilter("sort", "popular")}
            >
              Popular
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading posts…" : `${total} post${total === 1 ? "" : "s"}`}
        </p>
        {isPlaceholderData && (
          <span className="text-xs text-muted-foreground">Updating…</span>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <p className="font-medium">Could not load posts.</p>
          <p className="text-sm text-muted-foreground">
            Something went wrong. Please try again.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <SearchX className="size-8 text-muted-foreground" />
          <p className="font-medium">No posts found</p>
          <p className="text-sm text-muted-foreground">
            Try a different search or topic.
          </p>
          {hasFilters && (
            <Button variant="outline" onClick={() => setSearchParams({})}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className={cn("mt-10")}>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                to={pageHref(page - 1)}
                aria-disabled={page <= 1}
                className={cn(
                  page <= 1 && "pointer-events-none opacity-50",
                )}
                onClick={(event) => {
                  event.preventDefault()
                  if (page > 1) goToPage(page - 1)
                }}
              />
            </PaginationItem>

            {pageList(page, totalPages).map((item, index) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    to={pageHref(item)}
                    isActive={item === page}
                    onClick={(event) => {
                      event.preventDefault()
                      goToPage(item)
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                to={pageHref(Math.min(page + 1, totalPages))}
                aria-disabled={page >= totalPages}
                className={cn(
                  page >= totalPages && "pointer-events-none opacity-50",
                )}
                onClick={(event) => {
                  event.preventDefault()
                  if (page < totalPages) goToPage(page + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default ExplorePage
