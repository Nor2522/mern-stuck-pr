import { Construction } from "lucide-react"

const AdminPlaceholder = ({
  title,
  task,
}: {
  title: string
  task: string
}) => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-20 text-center">
    <Construction className="size-5 text-muted-foreground" />
    <h2 className="font-heading text-lg font-semibold">{title}</h2>
    <p className="text-sm text-muted-foreground">{task}</p>
  </div>
)

export default AdminPlaceholder