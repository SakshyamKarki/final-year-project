import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../app/AuthContext";

export default function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await auth.register(form);
      navigate("/login");
    } catch (e2) {
      const msg =
        e2?.response?.data?.email?.[0] ||
        e2?.response?.data?.username?.[0] ||
        e2?.response?.data?.password?.[0] ||
        "Registration failed.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-xl font-extrabold text-slate-900">Register</div>
        <div className="text-sm text-slate-500 mt-1">Create an account.</div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Username</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-teal-300"
              value={form.username}
              onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-teal-300"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-teal-300"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              required
            />
            <div className="text-xs text-slate-500 mt-1">Use a strong password.</div>
          </div>

          {err ? <div className="text-sm text-rose-600">{err}</div> : null}

          <Button className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Already have an account? <Link className="font-semibold text-teal-700 hover:underline" to="/login">Login</Link>
        </div>
      </Card>
    </div>
  );
}