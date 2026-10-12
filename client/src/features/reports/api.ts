import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/error"
import type { ApiMessage } from "@/types/api"

export const useCreateReport = (postId: string) =>
  useMutation({
    mutationFn: async (payload: { reason: string; details?: string }) => {
      const { data } = await api.post<ApiMessage>(
        `/post/${postId}/report`,
        payload,
      )
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message ?? "Post-ka waa la soo sheegay")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })