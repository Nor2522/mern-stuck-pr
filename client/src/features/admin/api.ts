import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/error"
import type { ApiMessage, ApiSuccess } from "@/types/api"
import type {
  AdminStats,
  AdminUser,
  AdminUsersResponse,
} from "@/types/admin"
import type { UserRole } from "@/types/user"

export const adminKeys = {
  all: ["admin"] as const,
  stats: ["admin", "stats"] as const,
  users: (params: AdminUsersParams) => ["admin", "users", params] as const,
}

export type AdminUsersParams = {
  page?: number
  limit?: number
  q?: string
  role?: UserRole
  status?: "active" | "banned"
  sort?: "newest" | "oldest"
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