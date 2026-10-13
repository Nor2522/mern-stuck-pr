import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/error"
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

export const bookmarksKeys = {
  all: ["bookmarks"] as const,
  list: (page: number) => ["bookmarks", "list", page] as const,
}

export const myPostsKeys = {
  all: ["my-posts"] as const,
  list: (page: number) => ["my-posts", "list", page] as const,
  stats: ["my-posts", "stats"] as const,
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

const fetchBookmarks = async (page: number): Promise<PostsResponse> => {
  const { data } = await api.get<ApiSuccess<PostsResponse>>("/bookmarks", {
    params: { page, limit: 9 },
  })
  return data.data
}

export const useBookmarks = (page = 1) =>
  useQuery({
    queryKey: bookmarksKeys.list(page),
    queryFn: () => fetchBookmarks(page),
    placeholderData: keepPreviousData,
  })

export const useToggleLike = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<
        ApiSuccess<{ liked: boolean; likesCount: number }>
      >(`/post/${postId}/like`)
      return data.data
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: postsKeys.detail(postId) })
      const previous = queryClient.getQueryData<PostType>(
        postsKeys.detail(postId),
      )
      if (previous) {
        queryClient.setQueryData<PostType>(postsKeys.detail(postId), {
          ...previous,
          likedByMe: !previous.likedByMe,
          likesCount: Math.max(
            0,
            previous.likesCount + (previous.likedByMe ? -1 : 1),
          ),
        })
      }
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(postsKeys.detail(postId), context.previous)
      }
      toast.error("Could not update like. Please try again.")
    },
    onSuccess: (data) => {
      queryClient.setQueryData<PostType>(postsKeys.detail(postId), (old) =>
        old
          ? { ...old, likedByMe: data.liked, likesCount: data.likesCount }
          : old,
      )
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: postsKeys.all }),
  })
}

export const useToggleBookmark = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiSuccess<{ bookmarked: boolean }>>(
        `/post/${postId}/bookmark`,
      )
      return data.data
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: postsKeys.detail(postId) })
      const previous = queryClient.getQueryData<PostType>(
        postsKeys.detail(postId),
      )
      if (previous) {
        queryClient.setQueryData<PostType>(postsKeys.detail(postId), {
          ...previous,
          bookmarkedByMe: !previous.bookmarkedByMe,
        })
      }
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(postsKeys.detail(postId), context.previous)
      }
      toast.error("Could not update saved posts. Please try again.")
    },
    onSuccess: (data) => {
      queryClient.setQueryData<PostType>(postsKeys.detail(postId), (old) =>
        old ? { ...old, bookmarkedByMe: data.bookmarked } : old,
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.all })
      queryClient.invalidateQueries({ queryKey: bookmarksKeys.all })
    },
  })
}

export interface MyPostsStats {
  totalPosts: number
  totalLikes: number
  totalComments: number
}

const fetchMyPosts = async (page: number): Promise<PostsResponse> => {
  const { data } = await api.get<ApiSuccess<PostsResponse>>("/post/user", {
    params: { page, limit: 12 },
  })
  return data.data
}

export const useMyPosts = (page = 1) =>
  useQuery({
    queryKey: myPostsKeys.list(page),
    queryFn: () => fetchMyPosts(page),
    placeholderData: keepPreviousData,
  })

export const useMyStats = () =>
  useQuery({
    queryKey: myPostsKeys.stats,
    queryFn: async (): Promise<MyPostsStats> => {
      const { data } =
        await api.get<ApiSuccess<MyPostsStats>>("/post/user/stats")
      return data.data
    },
  })

const invalidatePostCollections = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: postsKeys.all })
  queryClient.invalidateQueries({ queryKey: myPostsKeys.all })
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post<ApiSuccess<{ post: PostType }>>(
        "/post",
        formData,
      )
      return data.data.post
    },
    onSuccess: () => {
      invalidatePostCollections(queryClient)
      toast.success("Post created")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export const useUpdatePost = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.put<ApiSuccess<{ post: PostType }>>(
        `/post/${postId}`,
        formData,
      )
      return data.data.post
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(postId) })
      invalidatePostCollections(queryClient)
      toast.success("Post updated")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export const useDeletePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/post/${postId}`)
      return postId
    },
    onSuccess: () => {
      invalidatePostCollections(queryClient)
      toast.success("Post deleted")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}
