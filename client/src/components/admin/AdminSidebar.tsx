import { NavLink } from "react-router"
import {
  FileText,
  Flag,
  LayoutDashboard,
  MessageSquare,
  Tag,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/posts", label: "Posts", icon: FileText },
  { to: "/admin/comments", label: "Comments", icon: MessageSquare },
  { to: "/admin/reports", label: "Reports", icon: Flag },
  { to: "/admin/categories", label: "Categories", icon: Tag },
]

export const AdminSidebar = () => (
  <aside className="w-full shrink-0 md:w-56">
    <nav className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-2 md:sticky md:top-20 md:flex-col md:overflow-visible">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )
          }
        >
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
)