import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../app/AuthContext";

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await auth.login(form);
      navigate("/feed");
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-xl font-extrabold text-slate-900">Login</div>
        <div className="text-sm text-slate-500 mt-1">Access the application.</div>

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
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-teal-300"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              required
            />
          </div>

          {err ? <div className="text-sm text-rose-600">{err}</div> : null}

          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          No account? <Link className="font-semibold text-teal-700 hover:underline" to="/register">Register</Link>
        </div>
      </Card>
    </div>
  );
}