import { api } from "@/lib/api"
import type { ApiSuccess } from "@/types/api"
import type { AuthUser, LoginResponse } from "@/types/user"
import type { LoginFormValues, RegisterFormValues } from "./schemas"

export const meQueryKey = ["me"] as const

// Anonymous sessions get 200 with user: null (no 401 for logged-out visitors).
export const getMe = async (): Promise<AuthUser | null> => {
  const { data } = await api.get<ApiSuccess<{ user: AuthUser | null }>>(
    "/user/me",
  )
  return data.data.user
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
