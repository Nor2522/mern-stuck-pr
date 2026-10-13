import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PostForm } from "./PostForm"
import { useCreatePost } from "@/features/posts/api"

export const NewPostDialog = () => {
  const [open, setOpen] = useState(false)
  const createPost = useCreatePost()

  const handleSubmit = (formData: FormData) => {
    createPost
      .mutateAsync(formData)
      .then(() => setOpen(false))
      .catch(() => {})
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            New post
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create post</DialogTitle>
          <DialogDescription>
            Share what you built or learned. Image is optional.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <PostForm
            mode="create"
            submitting={createPost.isPending}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
