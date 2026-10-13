import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/error"
import { myPostsKeys, postsKeys } from "@/features/posts/api"
import type { ApiMessage, ApiSuccess } from "@/types/api"
import type {
  AdminStats,
  AdminUser,
  AdminUsersResponse,
} from "@/types/admin"
import type { PostStatus, PostsResponse } from "@/types/post"
import type { UserRole } from "@/types/user"

export const adminKeys = {
  all: ["admin"] as const,
  stats: ["admin", "stats"] as const,
  users: (params: AdminUsersParams) => ["admin", "users", params] as const,
  posts: (params: AdminPostsParams) => ["admin", "posts", params] as const,
}

export type AdminUsersParams = {
  page?: number
  limit?: number
  q?: string
  role?: UserRole
  status?: "active" | "banned"
  sort?: "newest" | "oldest"
}

export type AdminPostsParams = {
  page?: number
  limit?: number
  q?: string
  status?: PostStatus
  sort?: "newest" | "oldest" | "popular"
}

export const useAdminStats = () =>
  useQuery({
    queryKey: adminKeys.stats,
    queryFn: async (): Promise<AdminStats> => {
      const { data } = await api.get<ApiSuccess<AdminStats>>("/admin/stats")
      return data.data
    },
  })

export const useAdminUsers = (params: AdminUsersParams) =>
  useQuery({
    queryKey: adminKeys.users(params),
    queryFn: async (): Promise<AdminUsersResponse> => {
      const { data } = await api.get<ApiSuccess<AdminUsersResponse>>(
        "/admin/users",
        { params },
      )
      return data.data
    },
    placeholderData: keepPreviousData,
  })

const invalidateAdmin = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: adminKeys.all })
}

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const { data } = await api.patch<ApiMessage>(
        `/admin/users/${id}/role`,
        { role },
      )
      return data
    },
    onSuccess: (data: ApiMessage) => {
      invalidateAdmin(queryClient)
      toast.success(data.message)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export const useUpdateUserBan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      isBanned,
    }: {
      id: string
      isBanned: boolean
    }) => {
      const { data } = await api.patch<ApiMessage>(
        `/admin/users/${id}/ban`,
        { isBanned },
      )
      return data
    },
    onSuccess: (data: ApiMessage) => {
      invalidateAdmin(queryClient)
      toast.success(data.message)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiMessage>(`/admin/users/${id}`)
      return data
    },
    onSuccess: (data: ApiMessage) => {
      invalidateAdmin(queryClient)
      toast.success(data.message)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export type { AdminUser }

export const useAdminPosts = (params: AdminPostsParams) =>
  useQuery({
    queryKey: adminKeys.posts(params),
    queryFn: async (): Promise<PostsResponse> => {
      const { data } = await api.get<ApiSuccess<PostsResponse>>("/admin/posts", {
        params,
      })
      return data.data
    },
    placeholderData: keepPreviousData,
  })

const invalidatePosts = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: postsKeys.all })
  queryClient.invalidateQueries({ queryKey: myPostsKeys.all })
}

export const useUpdatePostStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PostStatus }) => {
      const { data } = await api.patch<ApiMessage>(`/admin/posts/${id}/status`, {
        status,
      })
      return data
    },
    onSuccess: (data: ApiMessage) => {
      invalidateAdmin(queryClient)
      invalidatePosts(queryClient)
      toast.success(data.message)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export const useDeleteAdminPost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiMessage>(`/admin/posts/${id}`)
      return data
    },
    onSuccess: (data: ApiMessage) => {
      invalidateAdmin(queryClient)
      invalidatePosts(queryClient)
      toast.success(data.message)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}