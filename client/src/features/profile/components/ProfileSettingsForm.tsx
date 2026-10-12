import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useAuth } from "@/features/auth/auth-context"
import { useUpdateProfile } from "@/features/profile/api"
import {
  profileSchema,
  type ProfileFormValues,
} from "@/features/profile/schemas"
import { getErrorMessage } from "@/lib/error"

const MAX_BIO = 160

export const ProfileSettingsForm = () => {
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()

  const [avatar, setAvatar] = useState<File | null>(null)
  const [preview, setPreview] = useState("")

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? "",
      bio: user?.bio ?? "",
    },
  })

  const { errors, isSubmitting } = form.formState
  const busy = isSubmitting || updateProfile.isPending

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setAvatar(file)
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
  }

  const removeImage = () => {
    setAvatar(null)
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return ""
    })
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync({
        name: values.name,
        bio: values.bio ?? "",
        avatar,
      })
      setAvatar(null)
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current)
        return ""
      })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  })

  const avatarUrl = preview || user?.avatar?.url
  const initial = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?"

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-20">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={user?.name ?? "avatar"} />}
            <AvatarFallback className="text-xl">{initial}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="avatar">Sawirka profaylka</FieldLabel>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleImage}
            />
            {avatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit"
                onClick={removeImage}
              >
                <X /> Ka noqo sawirka
              </Button>
            )}
          </div>
        </div>

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="profile-name">Magac</FieldLabel>
          <Input
            id="profile-name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...form.register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.bio}>
          <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
          <Textarea
            id="profile-bio"
            rows={3}
            maxLength={MAX_BIO}
            placeholder="Sheeg wax yar oo adiga kugu saabsan…"
            aria-invalid={!!errors.bio}
            {...form.register("bio")}
          />
          <FieldError errors={[errors.bio]} />
        </Field>
      </FieldGroup>

      <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={busy}>
        {busy ? "Waa la kaydinayaa…" : "Kaydi isbeddelka"}
      </Button>
    </form>
  )
}
