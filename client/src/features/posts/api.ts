import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { ApiSuccess } from "@/types/api"
import type { PostType, PostsResponse } from "@/types/post"

export type PostsParams = {
  page?: number
  limit?: number
  q?: string
  category?: string
  author?: string
  sort?: "latest" | "popular"
}

export const postsKeys = {
  all: ["posts"] as const,
  list: (params: PostsParams) => ["posts", "list", params] as const,
  detail: (id: string) => ["posts", "detail", id] as const,
}

export const fetchPosts = async (
  params?: PostsParams,
): Promise<PostsResponse> => {
  const { data } = await api.get<ApiSuccess<PostsResponse>>("/post", { params })
  return data.data
}

export const usePosts = (params: PostsParams) =>
  useQuery({
    queryKey: postsKeys.list(params),
    queryFn: () => fetchPosts(params),
    placeholderData: keepPreviousData,
  })

const fetchPost = async (id: string): Promise<PostType> => {
  const { data } = await api.get<ApiSuccess<{ post: PostType }>>(`/post/${id}`)
  return data.data.post
}

export const usePost = (id?: string) =>
  useQuery({
    queryKey: postsKeys.detail(id ?? ""),
    queryFn: () => fetchPost(id as string),
    enabled: Boolean(id),
    retry: false,
  })

export const useLatestPosts = (limit = 6) =>
  useQuery({
    queryKey: postsKeys.list({ page: 1, limit }),
    queryFn: () => fetchPosts({ page: 1, limit }),
  })
