import { createBrowserRouter } from "react-router"
import App from "./App"
import AboutPage from "./pages/AboutPage"
import AdminPage from "./pages/AdminPage"
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage"
import AdminCommentsPage from "./pages/admin/AdminCommentsPage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminPostsPage from "./pages/admin/AdminPostsPage"
import AdminReportsPage from "./pages/admin/AdminReportsPage"
import AdminUsersPage from "./pages/admin/AdminUsersPage"
import DashBoard from "./pages/DashBoard"
import ExplorePage from "./pages/ExplorePage"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import NotFoundPage from "./pages/NotFoundPage"
import PostDetailPage from "./pages/PostDetailPage"
import ProfilePage from "./pages/ProfilePage"
import RegisterPage from "./pages/RegisterPage"
import RouteErrorPage from "./pages/RouteErrorPage"
import SavedPage from "./pages/SavedPage"
import SettingsPage from "./pages/SettingsPage"
import { GuestRoute, ProtectedRoute, RoleRoute } from "./features/auth/guards"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "explore", element: <ExplorePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "posts/:id", element: <PostDetailPage /> },
      { path: "u/:id", element: <ProfilePage /> },
      {
        path: "login",
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: "register",
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashBoard />
          </ProtectedRoute>
        ),
      },
      {
        path: "saved",
        element: (
          <ProtectedRoute>
            <SavedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <RoleRoute role="admin">
        <AdminPage />
      </RoleRoute>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <AdminDashboard /> },
      {
        path: "users",
        element: <AdminUsersPage />,
      },
      {
        path: "posts",
        element: <AdminPostsPage />,
      },
      {
        path: "comments",
        element: <AdminCommentsPage />,
      },
      {
        path: "reports",
        element: <AdminReportsPage />,
      },
      {
        path: "categories",
        element: <AdminCategoriesPage />,
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
