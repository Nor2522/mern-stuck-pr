import { Bookmark } from "lucide-react"

const SavedPage = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-2xl font-semibold">Saved</h1>
      <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <Bookmark className="size-6 text-muted-foreground" />
        <p className="font-medium">No saved posts yet</p>
        <p className="text-sm text-muted-foreground">
          Bookmark a post and it will show up here.
        </p>
      </div>
    </div>
  )
}

export default SavedPage
