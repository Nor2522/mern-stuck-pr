import { useState } from "react"
import { Ellipsis, Flag } from "lucide-react"
import { type VariantProps } from "class-variance-authority"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/features/auth/auth-context"
import { ReportDialog } from "@/features/reports/components/ReportDialog"
import type { PostType } from "@/types/post"

// "More" dropdown: currently only has Report; post owners don't see it.
export const PostMenu = ({
  post,
  size = "xs",
}: {
  post: PostType
  size?: VariantProps<typeof buttonVariants>["size"]
}) => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user || post.author?._id === user._id) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size={size}
              aria-label="More actions"
            >
              <Ellipsis />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem variant="destructive" onClick={() => setOpen(true)}>
            <Flag />
            Report post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDialog postId={post._id} open={open} onOpenChange={setOpen} />
    </>
  )
}