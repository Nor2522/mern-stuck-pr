import { Link, isRouteErrorResponse, useLocation, useRouteError } from "react-router"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const RouteErrorPage = () => {
  useDocumentTitle("Something went wrong")
  const error = useRouteError()
  const location = useLocation()

  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : undefined

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-24 text-center">
      <AlertTriangle className="size-8 text-muted-foreground" />
      <h1 className="font-heading text-2xl font-semibold">
        Something went wrong
      </h1>
      <p className="text-muted-foreground">
        {message ??
          "An unexpected error occurred while rendering this page. Please try again."}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button
          nativeButton={false}
          render={<Link to="/" />}
        >
          Back home
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Route: {location.pathname}</p>
    </div>
  )
}

export default RouteErrorPage