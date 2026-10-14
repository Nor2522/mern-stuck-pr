import { Link, Outlet } from "react-router"
import { Code2 } from "lucide-react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminTopbar } from "@/components/admin/AdminTopbar"

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:py-8">
        <div className="flex items-center justify-between gap-4 md:hidden">
          <Link
            to="/admin"
            className="flex items-center gap-2 font-heading text-lg font-semibold"
          >
            <Code2 className="size-5 text-primary" />
            DevMotiv Admin
          </Link>
        </div>
        <AdminSidebar />
        <main className="min-w-0 flex-1">
          <AdminTopbar />
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminPage
