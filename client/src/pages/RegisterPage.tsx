import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router"
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
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas"
import { signUp } from "@/features/auth/api"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

type ServerFieldError = { field?: string; message?: string }

const RegisterPage = () => {
  useDocumentTitle("Sign up")
  const navigate = useNavigate()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  })

  const { errors, isSubmitting } = form.formState

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await signUp(values)
      toast.success("Your account was created successfully. Please log in.")
      navigate("/login")
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data as
          | { message?: string; errors?: ServerFieldError[] }
          | undefined
        const fieldErrors = data?.errors ?? []
        let mapped = false

        for (const item of fieldErrors) {
          if (item.field === "email" || item.field === "name") {
            form.setError(item.field, {
              message: item.message ?? "This information is already in use",
            })
            mapped = true
          }
        }

        const message =
          data?.message ??
          (error.code === "ERR_NETWORK"
            ? "Could not reach the server. Please try again."
            : error.message)

        if (!mapped) {
          form.setError("root", { message })
        }
        toast.error(message)
      } else {
        toast.error("Something went wrong")
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Join the community and share your progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  aria-invalid={!!errors.name}
                  {...form.register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>

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
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  aria-invalid={!!errors.password}
                  {...form.register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>

              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter the password"
                  aria-invalid={!!errors.confirmPassword}
                  {...form.register("confirmPassword")}
                />
                <FieldError errors={[errors.confirmPassword]} />
              </Field>
            </FieldGroup>

            {errors.root && <FieldError className="mt-4">{errors.root.message}</FieldError>}

            <Button
              type="submit"
              className="mt-6 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Register"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterPage
