import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"

import "./index.css"
import { router } from "./router"
import { queryClient } from "./lib/queryClient"
import { setupInterceptors } from "./lib/api"
import { AuthProvider } from "./features/auth/AuthProvider"
import { ThemeProvider } from "./components/theme-provider"

setupInterceptors(queryClient, (to) => {
  void router.navigate(to)
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster />
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
