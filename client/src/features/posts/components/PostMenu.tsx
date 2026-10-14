import { useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { Ellipsis, Flag, Pencil, Trash2 } from "lucide-react"
import { type VariantProps } from "class-variance-authority"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/features/auth/auth-context"
import { ReportDialog } from "@/features/reports/components/ReportDialog"
import { useDeletePost, useUpdatePost } from "@/features/posts/api"
import { PostForm } from "./PostForm"
import type { PostType } from "@/types/post"

// "More" dropdown: owners get Edit/Delete, other users can Report.
export const PostMenu = ({
  post,
  size = "xs",
}: {
  post: PostType
  size?: VariantProps<typeof buttonVariants>["size"]
}) => {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const updatePost = useUpdatePost(post._id)
  const deletePost = useDeletePost()

  const [reportOpen, setReportOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!user) return null

  if (post.author?._id !== user._id) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size={size} aria-label="More actions">
                <Ellipsis />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setReportOpen(true)}
            >
              <Flag />
              Report post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ReportDialog
          postId={post._id}
          open={reportOpen}
          onOpenChange={setReportOpen}
        />
      </>
    )
  }

  const handleDelete = () => {
    deletePost.mutate(post._id, {
      onSuccess: () => {
        setDeleteOpen(false)
        if (pathname === `/posts/${post._id}`) navigate("/dashboard")
      },
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size={size} aria-label="More actions">
              <Ellipsis />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil />
            Edit post
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
            Delete post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
            <DialogDescription>
              Update your post and save your changes.
            </DialogDescription>
          </DialogHeader>
          <PostForm
            mode="edit"
            post={post}
            submitting={updatePost.isPending}
            onSubmit={(formData) =>
              updatePost.mutate(formData, {
                onSuccess: () => setEditOpen(false),
              })
            }
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove “{post.title}” and all of its likes,
              comments and bookmarks. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePost.isPending}
              onClick={handleDelete}
            >
              {deletePost.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
