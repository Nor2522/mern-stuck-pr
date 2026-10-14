import { useEffect } from "react"
import { useLocation } from "react-router"

// Scrolls to the element referenced by the URL hash. Retries across a few
// animation frames so it also works when the target renders after async data
// (e.g. a direct link to a post's "#comments" while the post is still loading).
export const useScrollToHash = () => {
  const { hash, pathname } = useLocation()

  useEffect(() => {
    if (!hash) return

    const id = decodeURIComponent(hash.slice(1))
    let frame = 0
    let attempts = 0

    const tryScroll = () => {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
        return
      }
      if (attempts++ < 120) frame = requestAnimationFrame(tryScroll)
    }

    frame = requestAnimationFrame(tryScroll)
    return () => cancelAnimationFrame(frame)
  }, [hash, pathname])
}
