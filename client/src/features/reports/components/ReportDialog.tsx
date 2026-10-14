import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  REPORT_REASONS,
  reportSchema,
  type ReportFormValues,
} from "@/features/reports/schemas"
import { useCreateReport } from "@/features/reports/api"

const selectClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"

const MAX_DETAILS = 500

export const ReportDialog = ({
  postId,
  open,
  onOpenChange,
}: {
  postId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const createReport = useCreateReport(postId)

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reason: "", details: "" },
  })

  const { errors, isSubmitting } = form.formState
  const busy = isSubmitting || createReport.isPending

  // Reset the form whenever the dialog closes so a cancelled report does
  // not leak its values into the next open.
  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset()
    onOpenChange(next)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createReport.mutateAsync({
        reason: values.reason,
        details: values.details ?? "",
      })
      handleOpenChange(false)
    } catch {
      // Errors are surfaced by useCreateReport's onError toast.
    }
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report post</DialogTitle>
          <DialogDescription>
            Tell us what is wrong and our moderators will review it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FieldGroup>
            <Field data-invalid={!!errors.reason}>
              <FieldLabel htmlFor="report-reason">Reason</FieldLabel>
              <select
                id="report-reason"
                className={selectClass}
                aria-invalid={!!errors.reason}
                {...form.register("reason")}
              >
                <option value="">Select a reason</option>
                {REPORT_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
              <FieldError errors={[errors.reason]} />
            </Field>

            <Field data-invalid={!!errors.details}>
              <FieldLabel htmlFor="report-details">
                Details{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Textarea
                id="report-details"
                rows={4}
                maxLength={MAX_DETAILS}
                placeholder="Add anything else the moderators should know…"
                aria-invalid={!!errors.details}
                {...form.register("details")}
              />
              <FieldError errors={[errors.details]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Sending…" : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}