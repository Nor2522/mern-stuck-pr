import axios from "axios"
import { api } from "@/lib/api"
import type { ApiSuccess } from "@/types/api"
import type { AuthUser, LoginResponse } from "@/types/user"
import type { LoginFormValues, RegisterFormValues } from "./schemas"

export const meQueryKey = ["me"] as const

export const getMe = async (): Promise<AuthUser | null> => {
  try {
    const { data } = await api.get<ApiSuccess<{ user: AuthUser }>>("/user/me")
    return data.data.user
  } catch (error) {
    // 401 is a normal case when user is not logged in.
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null
    }
    throw error
  }
}

export const signIn = async (values: LoginFormValues): Promise<AuthUser> => {
  const { data } = await api.post<LoginResponse>("/user/login", values)
  return data.userData.user
}

export const signUp = async (values: RegisterFormValues): Promise<void> => {
  await api.post("/user/sign-up", {
    name: values.name,
    email: values.email,
    password: values.password,
  })
}

export const signOut = async (): Promise<void> => {
  await api.post("/user/sign-out")
}
