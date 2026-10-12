import {
  AtSign,
  Briefcase,
  Globe,
  Link2,
  MessageCircle,
  Share2,
} from "lucide-react"
import { toast } from "sonner"
import { type VariantProps } from "class-variance-authority"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getPostUrl, getShareTargets } from "@/lib/share"
import { cn } from "cn"

const icons = [AtSign, Globe, Briefcase, MessageCircle]

const canNativeShare = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function"

export const ShareMenu = ({
  postId,
  title,
  size = "xs",
  className,
}: {
  postId: string
  title: string
  size?: VariantProps<typeof buttonVariants>["size"]
  className?: string
}) => {
  const targets = getShareTargets(postId, title)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getPostUrl(postId))
      toast.success("Link copied to clipboard")
    } catch {
      toast.error("Could not copy the link")
    }
  }

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url: getPostUrl(postId) })
    } catch {
      // user cancelled or share not available
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size={size}
            className={cn(className)}
            aria-label="Share post"
          >
            <Share2 />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-48">
        {targets.map((target, index) => {
          const Icon = icons[index] ?? Share2
          return (
            <DropdownMenuItem
              key={target.label}
              render={
                <a
                  href={target.href}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Icon />
              {target.label}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyLink}>
          <Link2 />
          Copy link
        </DropdownMenuItem>
        {canNativeShare() && (
          <DropdownMenuItem onClick={nativeShare}>
            <Share2 />
            More options…
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
