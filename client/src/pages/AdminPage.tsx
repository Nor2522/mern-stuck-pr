import { Outlet } from "react-router"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminTopbar } from "@/components/admin/AdminTopbar"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const AdminPage = () => {
  useDocumentTitle("Admin")

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminTopbar />
        <Outlet />
      </div>
    </div>
  )
}

export default AdminPage