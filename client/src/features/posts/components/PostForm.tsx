import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { useCategories } from "@/features/categories/api"
import {
  MAX_TAGS,
  postFormSchema,
  toPostFormData,
  type PostFormValues,
} from "@/features/posts/schemas"
import type { PostType } from "@/types/post"

const selectClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"

type PostFormProps = {
  mode: "create" | "edit"
  post?: PostType
  submitting: boolean
  onSubmit: (formData: FormData) => void
  onCancel?: () => void
}

export const PostForm = ({
  mode,
  post,
  submitting,
  onSubmit,
  onCancel,
}: PostFormProps) => {
  const { data: categories = [] } = useCategories()
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState("")

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: post?.title ?? "",
      description: post?.description ?? "",
      category: post?.category?._id ?? "",
      tags: post?.tags?.join(", ") ?? "",
    },
  })

  const { errors, isSubmitting } = form.formState
  const busy = submitting || isSubmitting

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
  }

  const removeImage = () => {
    setImage(null)
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return ""
    })
  }

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(toPostFormData(values, image))
  })

  const existingImage = post?.image?.url

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field data-invalid={!!errors.title}>
        <FieldLabel htmlFor="post-title">Title</FieldLabel>
        <Input
          id="post-title"
          placeholder="Cinwaan gaaban oo cad"
          aria-invalid={!!errors.title}
          {...form.register("title")}
        />
        <FieldError errors={[errors.title]} />
      </Field>

      <Field data-invalid={!!errors.description}>
        <FieldLabel htmlFor="post-description">Description</FieldLabel>
        <Textarea
          id="post-description"
          rows={5}
          placeholder="Share what you built or learned…"
          aria-invalid={!!errors.description}
          {...form.register("description")}
        />
        <FieldError errors={[errors.description]} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.category}>
          <FieldLabel htmlFor="post-category">Category</FieldLabel>
          <select
            id="post-category"
            className={selectClass}
            {...form.register("category")}
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError errors={[errors.category]} />
        </Field>

        <Field data-invalid={!!errors.tags}>
          <FieldLabel htmlFor="post-tags">Tags</FieldLabel>
          <Input
            id="post-tags"
            placeholder={`Ilaa ${MAX_TAGS}: react, node, mongodb`}
            aria-invalid={!!errors.tags}
            {...form.register("tags")}
          />
          <FieldError errors={[errors.tags]} />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="post-image">Image (ikhtiyaari)</FieldLabel>
        <Input
          id="post-image"
          type="file"
          accept="image/*"
          onChange={handleImage}
        />
      </Field>

      {(preview || existingImage) && (
        <div className="relative w-full overflow-hidden rounded-lg border">
          <img
            src={preview || existingImage}
            alt="Preview"
            className="aspect-video w-full object-cover"
          />
          {image && (
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="absolute top-2 right-2"
              aria-label="Remove selected image"
              onClick={removeImage}
            >
              <X />
            </Button>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {busy
            ? mode === "create"
              ? "Creating…"
              : "Saving…"
            : mode === "create"
              ? "Create post"
              : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
