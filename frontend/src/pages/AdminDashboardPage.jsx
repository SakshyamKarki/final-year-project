import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth, isAdmin } from "../app/AuthContext";
import { adminDeleteUser, adminListUsers, adminUpdateUser } from "../api/moderation";

export default function AdminDashboardPage() {
  const auth = useAuth();
  const admin = isAdmin(auth.me);

  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await adminListUsers();
      setUsers(data);
    } catch {
      setErr("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStaff(u, is_staff) {
    try {
      await adminUpdateUser(u.id, { is_staff });
      await load();
    } catch {
      setErr("Failed to update user.");
    }
  }

  async function setActive(u, is_active) {
    try {
      await adminUpdateUser(u.id, { is_active });
      await load();
    } catch {
      setErr("Failed to update user.");
    }
  }

  async function del(u) {
    if (!confirm(`Delete user ${u.username}?`)) return;
    try {
      await adminDeleteUser(u.id);
      await load();
    } catch {
      setErr("Failed to delete user.");
    }
  }

  if (!admin) {
    return (
      <Card className="p-6">
        <div className="text-sm font-bold text-slate-900">Admin only</div>
        <div className="text-sm text-slate-500 mt-1">You don’t have access to admin features.</div>
      </Card>
    );
  }

  return (
    <div>
      <div className="text-xl font-extrabold text-slate-900">Admin</div>
      <div className="text-sm text-slate-500 mt-1">Manage users and permissions.</div>

      {err ? <div className="mt-4 text-sm text-rose-600">{err}</div> : null}
      {loading ? <div className="mt-6 text-sm text-slate-500">Loading...</div> : null}

      <Card className="mt-6 p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="py-2">Username</th>
              <th className="py-2">Email</th>
              <th className="py-2">Active</th>
              <th className="py-2">Staff</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-b-0">
                <td className="py-3 font-semibold text-slate-900">{u.username}</td>
                <td className="py-3 text-slate-700">{u.email}</td>
                <td className="py-3">{u.is_active ? "Yes" : "No"}</td>
                <td className="py-3">{u.is_staff ? "Yes" : "No"}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => setActive(u, !u.is_active)}>
                      {u.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="secondary" onClick={() => setStaff(u, !u.is_staff)}>
                      {u.is_staff ? "Remove staff" : "Make staff"}
                    </Button>
                    <Button variant="danger" onClick={() => del(u)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && users.length === 0 ? (
          <div className="text-sm text-slate-500">No users.</div>
        ) : null}
      </Card>
    </div>
  );
}