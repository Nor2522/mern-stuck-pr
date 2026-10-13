import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/features/auth/auth-context"
import { PasswordSettingsForm } from "@/features/profile/components/PasswordSettingsForm"
import { ProfileSettingsForm } from "@/features/profile/components/ProfileSettingsForm"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

export const SettingsPage = () => {
  useDocumentTitle("Settings")
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Update your profile or change your password.
      </p>

      <div className="mt-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Your name, bio and profile picture.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileSettingsForm />
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your account password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordSettingsForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage