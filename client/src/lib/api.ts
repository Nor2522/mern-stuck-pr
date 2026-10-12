import axios from "axios"
import { toast } from "sonner"
import type { QueryClient } from "@tanstack/react-query"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
})

// Same-ynta rasmiga ah: cookie-ga "token". Haddii uu dhaco 401 (session dhamaaday)
// waxaan nadiifinnaa cache-ka oo isticmaalaha u celinnaa bogga login-ka.
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
          toast.error("Fadlan soo gal (please log in)")
          navigate("/login")
        }
      }
      return Promise.reject(error)
    },
  )
}
