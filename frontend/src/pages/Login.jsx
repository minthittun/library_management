import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useUIStore from "../store/useUIStore";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const darkMode = useUIStore((state) => state.darkMode);

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

  const inputStyle = `w-full px-3 py-2 rounded-md border ${
    darkMode
      ? "bg-[#0d1117] border-gray-600 text-white placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  }`;

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-[#010409]" : "bg-[#f6f8fa]"}`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-md border ${darkMode ? "bg-[#161b22] border-gray-700" : "bg-white border-gray-200"}`}
      >
        <div className="text-center mb-6">
          <h1
            className={`text-2xl font-semibold mt-4 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Sign in to Library
          </h1>
        </div>

        {error && (
          <div
            className={`p-3 rounded-md text-sm mb-4 ${darkMode ? "bg-red-900/50 border border-red-700 text-red-400" : "bg-red-50 border border-red-200 text-red-600"}`}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Username
              </label>
              <input
                type="text"
                className={inputStyle}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Password
              </label>
              <input
                type="password"
                className={inputStyle}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 px-4 py-2 rounded-md text-sm font-medium ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            } disabled:opacity-50`}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
