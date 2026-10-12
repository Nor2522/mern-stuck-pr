import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { ApiSuccess } from "@/types/api"
import type { PostsResponse } from "@/types/post"

export const postsKeys = {
  all: ["posts"] as const,
  list: (params: Record<string, string | number | undefined>) =>
    ["posts", params] as const,
}

export type PostsParams = {
  page?: number
  limit?: number
  q?: string
  category?: string
  author?: string
  sort?: "latest" | "popular"
}

const fetchPosts = async (params?: PostsParams): Promise<PostsResponse> => {
  const { data } = await api.get<ApiSuccess<PostsResponse>>("/post", {
    params,
  })
  return data.data
}

export const useLatestPosts = (limit = 6) =>
  useQuery({
    queryKey: postsKeys.list({ scope: "latest", limit }),
    queryFn: () => fetchPosts({ page: 1, limit }),
  })