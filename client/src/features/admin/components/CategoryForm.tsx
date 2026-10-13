import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/features/admin/schemas"

type CategoryFormProps = {
  defaultName?: string
  submitLabel: string
  submitting: boolean
  onSubmit: (values: CategoryFormValues) => void
  onCancel?: () => void
}

export const CategoryForm = ({
  defaultName = "",
  submitLabel,
  submitting,
  onSubmit,
  onCancel,
}: CategoryFormProps) => {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: defaultName },
  })

  const { errors, isSubmitting } = form.formState
  const busy = submitting || isSubmitting

  const handleSubmit = form.handleSubmit((values) => onSubmit(values))

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor="category-name">Name</FieldLabel>
        <Input
          id="category-name"
          placeholder="e.g. Web Development"
          aria-invalid={!!errors.name}
          {...form.register("name")}
        />
        <FieldError errors={[errors.name]} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
