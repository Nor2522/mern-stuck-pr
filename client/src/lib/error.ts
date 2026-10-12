export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  return "Server-ka lama gaari karo"
}
