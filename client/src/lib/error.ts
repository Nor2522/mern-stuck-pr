import axios from "axios"

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (error.code === "ERR_NETWORK") return "Unable to reach the server"
    return error.message
  }
  if (error instanceof Error) return error.message
  return "Unable to reach the server"
}
