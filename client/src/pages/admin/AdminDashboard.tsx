import { Link } from "react-router"
import {
  FileText,
  Flag,
  MessageSquare,
  Users,
  type LucideIcon,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminStats } from "@/features/admin/api"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import type { AdminDailyPoint } from "@/types/admin"

const initials = (name: string) => name.trim().charAt(0).toUpperCase() || "?"

const formatDay = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })

const formatDateTime = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

const StatCard = ({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string
  value?: number
  icon: LucideIcon
  loading: boolean
}) => (
  <Card>
    <CardContent className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-10" />
        ) : (
          <p className="font-heading text-xl font-semibold">{value ?? 0}</p>
        )}
      </div>
    </CardContent>
  </Card>
)

const DailyChart = ({
  title,
  description,
  data,
  color,
}: {
  title: string
  description: string
  data: AdminDailyPoint[]
  color: string
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
          />
          <YAxis
            allowDecimals={false}
            width={32}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            labelFormatter={(label) => formatDay(String(label))}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--popover-foreground)",
            }}
          />
          <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

const AdminDashboard = () => {
  useDocumentTitle("Admin dashboard")
  const stats = useAdminStats()
  const data = stats.data

  if (stats.isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <p className="font-medium">Could not load dashboard stats.</p>
        <Button variant="outline" onClick={() => stats.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const loading = stats.isLoading

  return (
    <div>
      <header>
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          An overview of platform activity.
        </p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Users"
          value={data?.totals.users}
          icon={Users}
          loading={loading}
        />
        <StatCard
          label="Posts"
          value={data?.totals.posts}
          icon={FileText}
          loading={loading}
        />
        <StatCard
          label="Comments"
          value={data?.totals.comments}
          icon={MessageSquare}
          loading={loading}
        />
        <StatCard
          label="Open reports"
          value={data?.totals.openReports}
          icon={Flag}
          loading={loading}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {loading ? (
          <>
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </>
        ) : (
          <>
            <DailyChart
              title="New users"
              description="Last 14 days"
              data={data?.daily.users ?? []}
              color="var(--chart-1)"
            />
            <DailyChart
              title="New posts"
              description="Last 14 days"
              data={data?.daily.posts ?? []}
              color="var(--chart-2)"
            />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latest users</CardTitle>
            <CardDescription>The latest 5 users</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))
              : data?.latestUsers.map((user) => (
                  <Link
                    key={user._id}
                    to={`/u/${user._id}`}
                    className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-muted"
                  >
                    <Avatar size="sm">
                      {user.avatar?.url && (
                        <AvatarImage src={user.avatar.url} alt={user.name} />
                      )}
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    {user.role === "admin" && (
                      <Badge variant="secondary">Admin</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(user.createdAt)}
                    </span>
                  </Link>
                ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest posts</CardTitle>
            <CardDescription>The latest 5 posts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))
              : data?.latestPosts.map((post) => (
                  <Link
                    key={post._id}
                    to={`/posts/${post._id}`}
                    className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {post.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {post.author?.name ?? "Unknown"}
                      </p>
                    </div>
                    {post.status === "hidden" && (
                      <Badge variant="secondary">Hidden</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(post.createdAt)}
                    </span>
                  </Link>
                ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard