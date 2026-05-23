import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import AboutPage from "../pages/AboutPage";

import AppLayout from "../components/layouts/AppLayout";
import FeedPage from "../pages/FeedPage";
import UploadPage from "../pages/UploadPage";
import UserDashboardPage from "../pages/UserDashboardPage";
import UploadDetailPage from "../pages/UploadDetailPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import ModerationPage from "../pages/ModerationPage";

const routes = [
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/feed" replace /> },
      { path: "feed", element: <FeedPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "upload", element: <UploadPage /> },
      { path: "dashboard", element: <UserDashboardPage /> },
      { path: "uploads/:id", element: <UploadDetailPage /> },
      { path: "admin", element: <AdminDashboardPage /> },
      { path: "moderation", element: <ModerationPage /> },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
];

export default routes;