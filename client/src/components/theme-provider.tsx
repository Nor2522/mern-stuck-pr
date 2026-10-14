import { useEffect, useState, type ReactNode } from "react"
import {
  ThemeContext,
  type ResolvedTheme,
  type Theme,
} from "./theme-context"

const STORAGE_KEY = "devmotiv-theme"

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system"
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)
  const resolvedTheme = theme === "system" ? systemTheme : theme

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => setSystemTheme(media.matches ? "dark" : "light")
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark")
  }, [resolvedTheme])

  const setTheme = (next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
