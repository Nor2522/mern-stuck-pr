import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@/lib/api"
import type { ApiSuccess } from "@/types/api"
import type { CommentType, CommentsResponse } from "@/types/comment"
import { postsKeys } from "@/features/posts/api"

const PAGE_SIZE = 10

export const commentsKeys = {
  all: ["comments"] as const,
  list: (postId: string) => ["comments", "list", postId] as const,
}

const fetchComments = async (
  postId: string,
  page: number,
): Promise<CommentsResponse> => {
  const { data } = await api.get<ApiSuccess<CommentsResponse>>(
    `/post/${postId}/comments`,
    { params: { page, limit: PAGE_SIZE } },
  )
  return data.data
}

export const useComments = (postId: string) =>
  useInfiniteQuery({
    queryKey: commentsKeys.list(postId),
    queryFn: ({ pageParam }) => fetchComments(postId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
  })

export const useAddComment = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (text: string) => {
      const { data } = await api.post<
        ApiSuccess<{ comment: CommentType; commentsCount: number }>
      >(`/post/${postId}/comments`, { text })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.list(postId) })
      queryClient.invalidateQueries({ queryKey: postsKeys.all })
    },
    onError: () => toast.error("Could not post your comment. Please try again."),
  })
}

export const useDeleteComment = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/comment/${commentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.list(postId) })
      queryClient.invalidateQueries({ queryKey: postsKeys.all })
    },
    onError: () => toast.error("Could not delete the comment. Please try again."),
  })
}
