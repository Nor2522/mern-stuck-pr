import { createBrowserRouter } from "react-router"
import App from "./App"
import AdminPage from "./pages/AdminPage"
import DashBoard from "./pages/DashBoard"
import ExplorePage from "./pages/ExplorePage"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import NotFoundPage from "./pages/NotFoundPage"
import PostDetailPage from "./pages/PostDetailPage"
import ProfilePage from "./pages/ProfilePage"
import RegisterPage from "./pages/RegisterPage"
import SavedPage from "./pages/SavedPage"
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
        path: "admin/*",
        element: (
          <RoleRoute role="admin">
            <AdminPage />
          </RoleRoute>
        ),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
