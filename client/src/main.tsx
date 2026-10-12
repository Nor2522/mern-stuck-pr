import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// 1. Ku dar RouterProvider import-ga
import { createBrowserRouter, RouterProvider } from "react-router";

import "./index.css";
import App from "./App.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import DashBoard from "./pages/DashBoard.tsx";
import { Toaster as SonnerToaster } from "sonner";
import { UserProvider } from "./hooks/UserProvider.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/dashboard",
        element: <DashBoard />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <SonnerToaster />
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>,
);
