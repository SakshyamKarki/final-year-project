import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ConfirmButton from "../components/ui/ConfirmButton";
import { RowSkeleton } from "../components/ui/Skeleton";
import { useAuth, isAdmin } from "../app/AuthContext";
import { useToast } from "../app/ToastContext";
import { adminDeleteUser, adminListUsers, adminUpdateUser } from "../api/moderation";

function UserRow({ u, currentUserId, onRefresh }) {
  const toast = useToast();

  async function setStaff(is_staff) {
    try {
      await adminUpdateUser(u.id, { is_staff });
      toast.success(
        `${u.username} ${is_staff ? "promoted to" : "removed from"} staff.`
      );
      await onRefresh();
    } catch (e) {
      toast.error(
        e?.response?.data?.detail || "Failed to update user."
      );
    }
  }

  async function setActive(is_active) {
    try {
      await adminUpdateUser(u.id, { is_active });
      toast.success(
        `${u.username} ${is_active ? "activated" : "deactivated"}.`
      );
      await onRefresh();
    } catch (e) {
      toast.error(
        e?.response?.data?.detail || "Failed to update user."
      );
    }
  }

  async function del() {
    try {
      await adminDeleteUser(u.id);
      toast.success(`${u.username} deleted.`);
      await onRefresh();
    } catch (e) {
      toast.error(
        e?.response?.data?.detail || "Failed to delete user."
      );
    }
  }

  const isSelf = u.id === currentUserId;

  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="py-3 font-semibold text-slate-900">
        {u.username}
        {isSelf && (
          <span className="ml-2 text-xs text-slate-400 font-normal">(you)</span>
        )}
      </td>
      <td className="py-3 text-slate-600 text-xs">{u.email}</td>
      <td className="py-3 text-center">
        <span
          className={`text-xs font-semibold ${
            u.is_active ? "text-teal-600" : "text-slate-400"
          }`}
        >
          {u.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="py-3 text-center">
        <span
          className={`text-xs font-semibold ${
            u.is_staff ? "text-teal-600" : "text-slate-400"
          }`}
        >
          {u.is_staff ? "Yes" : "No"}
        </span>
      </td>
      <td className="py-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => setActive(!u.is_active)}
            disabled={isSelf && u.is_active}
            title={isSelf ? "Cannot deactivate yourself" : undefined}
          >
            {u.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setStaff(!u.is_staff)}
            disabled={isSelf && u.is_staff}
            title={isSelf ? "Cannot demote yourself" : undefined}
          >
            {u.is_staff ? "Remove staff" : "Make staff"}
          </Button>
          <ConfirmButton
            label="Delete"
            confirmLabel="Yes, delete"
            onConfirm={del}
            disabled={isSelf}
            title={isSelf ? "Cannot delete yourself" : undefined}
          />
        </div>
      </td>
    </tr>
  );
}

export default function AdminDashboardPage() {
  const auth = useAuth();
  const toast = useToast();
  const admin = isAdmin(auth.me);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setUsers(await adminListUsers());
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!admin) {
    return (
      <Card className="p-6">
        <div className="text-sm font-bold text-slate-900">Admin only</div>
        <div className="text-sm text-slate-500 mt-1">
          You don't have access to admin features.
        </div>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold text-slate-900">Admin</h1>
      <p className="text-sm text-slate-500 mt-1">Manage users and permissions.</p>

      <Card className="mt-6 p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200 text-xs uppercase tracking-wide">
              <th className="pb-2 pr-4">Username</th>
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4 text-center">Status</th>
              <th className="pb-2 pr-4 text-center">Staff</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="py-1">
                      <RowSkeleton />
                    </td>
                  </tr>
                ))
              : users.map((u) => (
                  <UserRow
                    key={u.id}
                    u={u}
                    currentUserId={auth.me?.id}
                    onRefresh={load}
                  />
                ))}
          </tbody>
        </table>

        {!loading && users.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-500">
            No users found.
          </div>
        )}
      </Card>
    </div>
  );
}
