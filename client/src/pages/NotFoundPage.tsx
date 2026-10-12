import { Link } from "react-router"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const NotFoundPage = () => {
  useDocumentTitle("Page not found")

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-24 text-center">
      <FileQuestion className="size-8 text-muted-foreground" />
      <h1 className="font-heading text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist or was moved.
      </p>
      <Button
        className="mt-2"
        render={<Link to="/" />}
        nativeButton={false}
      >
        Back home
      </Button>
    </div>
  )
}

export default NotFoundPage
