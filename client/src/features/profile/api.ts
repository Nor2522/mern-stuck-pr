import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/error"
import { meQueryKey } from "@/features/auth/api"
import { commentsKeys } from "@/features/comments/api"
import { postsKeys } from "@/features/posts/api"
import type { ApiSuccess } from "@/types/api"
import type { AuthUser, PublicProfile } from "@/types/user"

export const profileKeys = {
  all: ["profile"] as const,
  detail: (id: string) => ["profile", id] as const,
}

export const useProfile = (id?: string) =>
  useQuery({
    queryKey: profileKeys.detail(id ?? ""),
    enabled: Boolean(id),
    retry: false,
    queryFn: async (): Promise<PublicProfile> => {
      const { data } = await api.get<ApiSuccess<{ user: PublicProfile }>>(
        `/user/${id}`,
      )
      return data.data.user
    },
  })

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      name: string
      bio?: string
      avatar: File | null
    }): Promise<AuthUser> => {
      const formData = new FormData()
      formData.append("name", payload.name)
      if (payload.bio !== undefined) formData.append("bio", payload.bio)
      if (payload.avatar) formData.append("avatar", payload.avatar)

      const { data } = await api.put<ApiSuccess<{ user: AuthUser }>>(
        "/user/me",
        formData,
      )
      return data.data.user
    },
    onSuccess: (user) => {
      queryClient.setQueryData(meQueryKey, user)
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
      queryClient.invalidateQueries({ queryKey: postsKeys.all })
      queryClient.invalidateQueries({ queryKey: commentsKeys.all })
      toast.success("Profaylka waa la cusboonaysiiyay")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export const useChangePassword = () =>
  useMutation({
    mutationFn: async (payload: {
      currentPassword: string
      newPassword: string
    }) => {
      await api.put("/user/me/password", payload)
    },
    onSuccess: () => toast.success("Password-ka waa la beddelay"),
    onError: (error) => toast.error(getErrorMessage(error)),
  })
