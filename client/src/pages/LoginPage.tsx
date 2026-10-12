import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PasswordInput } from "@/features/auth/components/PasswordInput"
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas"
import { signIn } from "@/features/auth/api"
import { useAuth } from "@/features/auth/auth-context"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const LoginPage = () => {
  useDocumentTitle("Soo gal")
  const { login } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const { errors, isSubmitting } = form.formState

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const user = await signIn(values)
      login(user)
      toast.success("Waad soo gashay")
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : "Khalad ayaa dhacay"
      form.setError("root", { message })
      toast.error(message)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Ku soo dhawoow mar kale</CardTitle>
          <CardDescription>
            Soo gal si aad u maamusho post-yadaada oo aad wax qorto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  aria-invalid={!!errors.email}
                  {...form.register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  placeholder="Geli password-kaaga"
                  aria-invalid={!!errors.password}
                  {...form.register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>
            </FieldGroup>

            {errors.root && <FieldError className="mt-4">{errors.root.message}</FieldError>}

            <Button
              type="submit"
              className="mt-6 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Soo galaya…" : "Soo gal"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ma haysatid akoon?{" "}
            <Link
              to="/register"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Isdiiwaangeli
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
