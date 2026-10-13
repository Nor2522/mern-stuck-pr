import { createBrowserRouter } from "react-router"
import App from "./App"
import AdminPage from "./pages/AdminPage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminPlaceholder from "./pages/admin/AdminPlaceholder"
import AdminUsersPage from "./pages/admin/AdminUsersPage"
import DashBoard from "./pages/DashBoard"
import ExplorePage from "./pages/ExplorePage"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import NotFoundPage from "./pages/NotFoundPage"
import PostDetailPage from "./pages/PostDetailPage"
import ProfilePage from "./pages/ProfilePage"
import RegisterPage from "./pages/RegisterPage"
import SavedPage from "./pages/SavedPage"
import SettingsPage from "./pages/SettingsPage"
import { GuestRoute, ProtectedRoute, RoleRoute } from "./features/auth/guards"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "explore", element: <ExplorePage /> },
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
      {
        path: "admin",
        element: (
          <RoleRoute role="admin">
            <AdminPage />
          </RoleRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          {
            path: "users",
            element: <AdminUsersPage />,
          },
          {
            path: "posts",
            element: <AdminPlaceholder title="Posts" task="T3.3" />,
          },
          {
            path: "comments",
            element: <AdminPlaceholder title="Comments" task="T3.4" />,
          },
          {
            path: "reports",
            element: <AdminPlaceholder title="Reports" task="T3.4" />,
          },
          {
            path: "categories",
            element: <AdminPlaceholder title="Categories" task="T3.5" />,
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
