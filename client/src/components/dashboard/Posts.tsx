import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/error"
import { Card, CardContent } from "@/components/ui/card"
import type { PostType } from "@/types/post"
import Post from "./Post"

const SkeletonCard = () => (
  <Card className="animate-pulse">
    <div className="aspect-video w-full rounded-t-xl bg-muted" />
    <CardContent className="space-y-2 pt-4">
      <div className="h-4 w-1/2 rounded bg-muted" />
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-4 w-1/4 rounded bg-muted" />
    </CardContent>
  </Card>
)

const Posts = ({
  refreshKey = 0,
  onChanged,
}: {
  refreshKey?: number
  onChanged?: () => void
}) => {
  const [postData, setPostData] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const readUserPost = async () => {
      setLoading(true)
      try {
        const { data } = await api.get("/post")
        setPostData(data.data.posts)
      } catch (error) {
        toast.error(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }
    readUserPost()
  }, [refreshKey])

  const gridClass = "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  }

  if (postData.length === 0) {
    return <p className="text-muted-foreground">No posts yet</p>
  }

  return (
    <div className={gridClass}>
      {postData.map((post) => (
        <Post key={post._id} post={post} onChanged={onChanged} />
      ))}
    </div>
  )
}

export default Posts
