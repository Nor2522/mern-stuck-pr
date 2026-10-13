import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/error"
import { useAuth } from "@/features/auth/auth-context"
import type { PostType } from "@/types/post"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EditForm = {
  title: string
  description: string
}

const formatDate = (value?: string) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString()
}

const EditPostDialog = ({
  post,
  onChanged,
}: {
  post: PostType
  onChanged?: () => void
}) => {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditForm>({
    defaultValues: { title: post.title, description: post.description },
  })

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (values: EditForm) => {
    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("description", values.description)
      if (image) formData.append("image", image)
      await api.put(`/post/${post._id}`, formData)
      toast.success("Post updated")
      setOpen(false)
      onChanged?.()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          reset({ title: post.title, description: post.description })
          setImage(null)
          setPreview("")
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Edit post">
            <Pencil />
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
            <DialogDescription>Update title, description, and image.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor={`title-${post._id}`}>Title</Label>
            <Input
              id={`title-${post._id}`}
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`description-${post._id}`}>Description</Label>
            <Input
              id={`description-${post._id}`}
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`image-${post._id}`}>Image</Label>
            <Input
              id={`image-${post._id}`}
              type="file"
              accept="image/*"
              onChange={handleImage}
            />
            <img
              src={preview || post.image?.url}
              alt={post.title}
              className="aspect-video w-full rounded-md object-cover"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const DeletePostDialog = ({
  post,
  onChanged,
}: {
  post: PostType
  onChanged?: () => void
}) => {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await api.delete(`/post/${post._id}`)
      toast.success("Post deleted")
      setOpen(false)
      onChanged?.()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Delete post">
            <Trash2 />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This post will be deleted and cannot be recovered.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={deleting}
            onClick={() => handleDelete()}
          >
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const Post = ({
  post,
  onChanged,
}: {
  post: PostType
  onChanged?: () => void
}) => {
  const { user } = useAuth()
  const currentUserId = user?._id
  const isOwner = Boolean(currentUserId && post.author?._id === currentUserId)
  const createdAt = formatDate(post.createdAt)
  const authorName = post.author?.name ?? "Unknown"

  return (
    <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      {post.image?.url ? (
        <img
          src={post.image.url}
          alt={post.title}
          className="aspect-video w-full rounded-t-xl object-cover"
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-t-xl bg-muted text-sm text-muted-foreground">
          Image
        </div>
      )}
      <CardHeader className="flex-1">
        <CardTitle className="line-clamp-1 font-semibold">
          {post.title}
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {post.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{authorName}</span>
            {createdAt && (
              <span className="text-xs text-muted-foreground">{createdAt}</span>
            )}
          </div>
        </div>
        {isOwner && (
          <div className="flex items-center gap-1">
            <EditPostDialog post={post} onChanged={onChanged} />
            <DeletePostDialog post={post} onChanged={onChanged} />
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

export default Post
