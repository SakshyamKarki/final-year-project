import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth, isAdmin } from "../../app/AuthContext";
import Button from "../ui/Button";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-xl text-sm font-semibold ${
          isActive ? "bg-teal-50 text-slate-900" : "text-slate-600 hover:bg-slate-50"
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
  const navigate = useNavigate();
  const admin = isAdmin(auth.me);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900" />
            <div>
              <div className="text-sm font-extrabold text-slate-900">Application</div>
              <div className="text-xs text-slate-500">Media authenticity & news verification</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {auth.me ? `Signed in as ${auth.me.username}` : ""}
            </span>
            <Button
              variant="secondary"
              onClick={() => {
                auth.logout();
                navigate("/login");
              }}
            >
              Logout
            </Button>
          </div>
        </div>

      <nav className="mx-auto max-w-6xl px-4 pb-3 flex gap-2 flex-wrap">
        <NavItem to="/feed">Feed</NavItem>
        <NavItem to="/upload">Upload</NavItem>
        <NavItem to="/dashboard">My uploads</NavItem>

        {admin ? (
          <>
            <NavItem to="/admin">Admin</NavItem>
            <NavItem to="/moderation">Moderation</NavItem>
          </>
        ) : null}
        <NavItem to="/about">About</NavItem>

      </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}