import axios from "axios"
import { api } from "@/lib/api"
import type { ApiSuccess } from "@/types/api"
import type { AuthUser } from "@/types/user"

export const meQueryKey = ["me"] as const

export const getMe = async (): Promise<AuthUser | null> => {
  try {
    const { data } = await api.get<ApiSuccess<{ user: AuthUser }>>("/user/me")
    return data.data.user
  } catch (error) {
    // 401 waa xaalad caadi ah marka isticmaalahu aanu soo galin.
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null
    }
    throw error
  }
}

export const signOut = async (): Promise<void> => {
  await api.post("/user/sign-out")
}
