import { useParams } from "react-router"

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-2xl font-semibold">Post</h1>
      <p className="mt-2 text-muted-foreground">
        Full post view for <span className="font-mono">{id}</span> is built in
        T1.4.
      </p>
    </div>
  )
}

export default PostDetailPage
