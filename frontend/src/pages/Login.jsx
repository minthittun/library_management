import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useUIStore from "../store/useUIStore";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const darkMode = useUIStore((state) => state.darkMode);
  const toggleDarkMode = useUIStore((state) => state.toggleDarkMode);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(form.username, form.password);
    setLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <button
        onClick={toggleDarkMode}
        className="absolute right-4 top-4 rounded-xl border px-3 py-1.5 text-sm font-medium transition hover:bg-[var(--accent-soft)]"
        style={{ borderColor: "var(--panel-border)", color: "var(--text)" }}
      >
        {darkMode ? "Light mode" : "Dark mode"}
      </button>

      <div className="panel w-full max-w-md rounded-2xl p-7 md:p-8">
        <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
          Welcome back
        </p>
        <h1 className="mt-2 text-3xl font-semibold" style={{ color: "var(--text)" }}>
          Library Console
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Sign in to manage books, memberships, and sales.
        </p>

        {error && (
          <div
            className="mt-5 rounded-xl border px-3 py-2 text-sm"
            style={{
              color: "var(--status-danger)",
              borderColor: "color-mix(in srgb, var(--status-danger) 30%, transparent)",
              background: "color-mix(in srgb, var(--status-danger) 10%, transparent)",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>
              Username
            </label>
            <input
              type="text"
              className="modern-input w-full rounded-xl px-3 py-2"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>
              Password
            </label>
            <input
              type="password"
              className="modern-input w-full rounded-xl px-3 py-2"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-btn mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
