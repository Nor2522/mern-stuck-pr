import axios from "axios"
import { toast } from "sonner"
import type { QueryClient } from "@tanstack/react-query"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
})

// Auth mechanism: httpOnly cookie "token". If 401 occurs (session expired)
// clear cache and redirect to login page.
export const setupInterceptors = (
  queryClient: QueryClient,
  navigate: (to: string) => void,
) => {
  api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const url = error.config?.url ?? ""
        const isSessionCheck = url.includes("/user/me")
        if (!isSessionCheck) {
          queryClient.clear()
          toast.error("Please log in")
          navigate("/login")
        }
      }
      return Promise.reject(error)
    },
  )
}
