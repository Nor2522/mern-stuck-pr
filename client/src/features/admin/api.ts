import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/error"
import { categoriesKeys } from "@/features/categories/api"
import { commentsKeys } from "@/features/comments/api"
import { myPostsKeys, postsKeys } from "@/features/posts/api"
import type { ApiMessage, ApiSuccess } from "@/types/api"
import type {
  AdminCommentsResponse,
  AdminReportsResponse,
  AdminStats,
  AdminUser,
  AdminUsersResponse,
  ReportStatus,
} from "@/types/admin"
import type { AdminCategory } from "@/types/category"
import type { PostStatus, PostsResponse } from "@/types/post"
import type { UserRole } from "@/types/user"

export const adminKeys = {
  all: ["admin"] as const,
  stats: ["admin", "stats"] as const,
  users: (params: AdminUsersParams) => ["admin", "users", params] as const,
  posts: (params: AdminPostsParams) => ["admin", "posts", params] as const,
  reports: (params: AdminReportsParams) =>
    ["admin", "reports", params] as const,
  comments: (params: AdminCommentsParams) =>
    ["admin", "comments", params] as const,
  categories: ["admin", "categories"] as const,
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

export type AdminReportsParams = {
  page?: number
  limit?: number
  status?: ReportStatus
}

export type AdminCommentsParams = {
  page?: number
  limit?: number
  q?: string
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

export const useAdminReports = (params: AdminReportsParams) =>
  useQuery({
    queryKey: adminKeys.reports(params),
    queryFn: async (): Promise<AdminReportsResponse> => {
      const { data } = await api.get<ApiSuccess<AdminReportsResponse>>(
        "/admin/reports",
        { params },
      )
      return data.data
    },
    placeholderData: keepPreviousData,
  })

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: Extract<ReportStatus, "resolved" | "dismissed">
    }) => {
      const { data } = await api.patch<ApiMessage>(`/admin/reports/${id}`, {
        status,
      })
      return data
    },
    onSuccess: (data: ApiMessage) => {
      invalidateAdmin(queryClient)
      toast.success(data.message)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export const useAdminComments = (params: AdminCommentsParams) =>
  useQuery({
    queryKey: adminKeys.comments(params),
    queryFn: async (): Promise<AdminCommentsResponse> => {
      const { data } = await api.get<ApiSuccess<AdminCommentsResponse>>(
        "/admin/comments",
        { params },
      )
      return data.data
    },
    placeholderData: keepPreviousData,
  })

export const useDeleteAdminComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiMessage>(`/admin/comments/${id}`)
      return data
    },
    onSuccess: (data: ApiMessage) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      queryClient.invalidateQueries({ queryKey: commentsKeys.all })
      queryClient.invalidateQueries({ queryKey: postsKeys.all })
      toast.success(data.message)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export const useAdminCategories = () =>
  useQuery({
    queryKey: adminKeys.categories,
    queryFn: async (): Promise<AdminCategory[]> => {
      const { data } = await api.get<ApiSuccess<{ categories: AdminCategory[] }>>(
        "/admin/categories",
      )
      return data.data.categories
    },
  })

const invalidateCategories = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: adminKeys.all })
  queryClient.invalidateQueries({ queryKey: categoriesKeys.all })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post<ApiMessage>("/admin/categories", { name })
      return data
    },
    onSuccess: () => {
      invalidateCategories(queryClient)
      toast.success("Category created")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export const useRenameCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data } = await api.patch<ApiMessage>(`/admin/categories/${id}`, {
        name,
      })
      return data
    },
    onSuccess: (data: ApiMessage) => {
      invalidateCategories(queryClient)
      toast.success(data.message)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      reassignTo,
    }: {
      id: string
      reassignTo?: string
    }) => {
      const { data } = await api.delete<ApiMessage>(`/admin/categories/${id}`, {
        params: reassignTo ? { reassignTo } : undefined,
      })
      return data
    },
    onSuccess: (data: ApiMessage) => {
      invalidateCategories(queryClient)
      toast.success(data.message)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}