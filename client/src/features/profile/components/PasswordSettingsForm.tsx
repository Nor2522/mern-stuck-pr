import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PasswordInput } from "@/features/auth/components/PasswordInput"
import { useChangePassword } from "@/features/profile/api"
import {
  passwordChangeSchema,
  type PasswordChangeFormValues,
} from "@/features/profile/schemas"
import { getErrorMessage } from "@/lib/error"

export const PasswordSettingsForm = () => {
  const changePassword = useChangePassword()

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const { errors, isSubmitting } = form.formState
  const busy = isSubmitting || changePassword.isPending

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      form.reset()
      toast.success("Password-ka waa la beddelay")
    } catch (error) {
      form.setError("currentPassword", { message: getErrorMessage(error) })
      toast.error(getErrorMessage(error))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.currentPassword}>
          <FieldLabel htmlFor="current-password">Password-ka hadda</FieldLabel>
          <PasswordInput
            id="current-password"
            autoComplete="current-password"
            aria-invalid={!!errors.currentPassword}
            {...form.register("currentPassword")}
          />
          <FieldError errors={[errors.currentPassword]} />
        </Field>

        <Field data-invalid={!!errors.newPassword}>
          <FieldLabel htmlFor="new-password">Password cusub</FieldLabel>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            placeholder="Ugu yaraan 8 xaraf, hal xaraf iyo hal lambar"
            aria-invalid={!!errors.newPassword}
            {...form.register("newPassword")}
          />
          <FieldError errors={[errors.newPassword]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirm-password">Xaqiiji password-ka</FieldLabel>
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            placeholder="Ku celi password-ka cusub"
            aria-invalid={!!errors.confirmPassword}
            {...form.register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>

      <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={busy}>
        {busy ? "Waa la beddelayaa…" : "Beddel password-ka"}
      </Button>
    </form>
  )
}