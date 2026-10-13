import { useState } from "react"
import { Link } from "react-router"
import { format } from "date-fns"
import { Code2, Heart, MessageSquare, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog"
import { PostForm } from "./PostForm"
import { useDeletePost, useUpdatePost } from "@/features/posts/api"
import { getOptimizedImageUrl } from "@/lib/image"
import type { PostType } from "@/types/post"

export const MyPostCard = ({ post }: { post: PostType }) => {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const updatePost = useUpdatePost(post._id)
  const deletePost = useDeletePost()

  const created = new Date(post.createdAt)

  const handleEdit = (formData: FormData) => {
    updatePost
      .mutateAsync(formData)
      .then(() => setEditOpen(false))
      .catch(() => {})
  }

  const handleDelete = () => {
    deletePost
      .mutateAsync(post._id)
      .then(() => setDeleteOpen(false))
      .catch(() => {})
  }

  return (
    <Card className="flex h-full flex-col">
      <Link to={`/posts/${post._id}`} className="block">
        {post.image?.url ? (
          <img
            src={getOptimizedImageUrl(post.image.url, 600)}
            alt={post.title}
            className="aspect-video w-full rounded-t-xl object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-t-xl bg-muted text-muted-foreground">
            <Code2 className="size-6" />
          </div>
        )}
      </Link>

      <CardHeader className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={post.status === "published" ? "secondary" : "outline"}
            className="capitalize"
          >
            {post.status}
          </Badge>
          {post.category && (
            <Badge variant="outline" className="capitalize">
              {post.category.name}
            </Badge>
          )}
        </div>
        <Link to={`/posts/${post._id}`}>
          <CardTitle className="line-clamp-1 font-semibold hover:underline">
            {post.title}
          </CardTitle>
        </Link>
      </CardHeader>

      <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Heart className="size-4" />
          {post.likesCount}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="size-4" />
          {post.commentsCount}
        </span>
        <time className="ml-auto" dateTime={post.createdAt}>
          {format(created, "PP")}
        </time>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
        >
          <Pencil />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Delete post"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="text-destructive" />
        </Button>
      </CardFooter>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
            <DialogDescription>
              Update the title, description, category, tags or image.
            </DialogDescription>
          </DialogHeader>
          {editOpen && (
            <PostForm
              mode="edit"
              post={post}
              submitting={updatePost.isPending}
              onSubmit={handleEdit}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This post will be deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePost.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deletePost.isPending}
              onClick={handleDelete}
            >
              {deletePost.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
