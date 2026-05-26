import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth, isAdmin } from "../../app/AuthContext";
import { useToast } from "../../app/ToastContext";
import Button from "../ui/Button";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-xl text-sm font-semibold transition ${
          isActive
            ? "bg-teal-50 text-slate-900"
            : "text-slate-600 hover:bg-slate-50"
        }`
      }
      end
    >
      {children}
    </NavLink>
  );
}

export default function AppLayout() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const admin = isAdmin(auth.me);

  async function handleLogout() {
    try {
      await auth.logout();
    } catch {
      // Swallow — client side is cleaned up regardless
    }
    navigate("/login");
    toast.info("You've been signed out.");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">
                Content Verification System
              </div>
              <div className="text-xs text-slate-500">
                AI-generated image detection
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {auth.me && (
              <span className="text-xs text-slate-500 hidden sm:block">
                {auth.me.username}
              </span>
            )}
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <nav className="mx-auto max-w-6xl px-4 pb-3 flex gap-1 flex-wrap">
          <NavItem to="/feed">Feed</NavItem>
          <NavItem to="/upload">Upload</NavItem>
          <NavItem to="/dashboard">My uploads</NavItem>
          {admin && (
            <>
              <NavItem to="/moderation">Moderation</NavItem>
              <NavItem to="/admin">Admin</NavItem>
            </>
          )}
          <NavItem to="/about">About</NavItem>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
