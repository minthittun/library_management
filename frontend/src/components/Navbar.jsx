import { useEffect } from "react";
import useUIStore from "../store/useUIStore";

function Navbar({ onLogout, user }) {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const darkMode = useUIStore((state) => state.darkMode);
  const toggleDarkMode = useUIStore((state) => state.toggleDarkMode);
  const density = useUIStore((state) => state.density);
  const toggleDensity = useUIStore((state) => state.toggleDensity);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    }
  }, [darkMode]);

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-3 z-30 rounded-xl border px-2.5 py-2 text-[var(--text)] transition hover:scale-[1.02] panel"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        )}
      </button>

      <nav className="fixed inset-x-0 top-0 z-20 border-b panel">
        <div className="ml-12 flex items-center justify-between px-4 py-3 md:px-6">
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              Library Management
            </h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Multi-branch operations dashboard
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleDensity}
              className="rounded-xl border px-2.5 py-2 text-xs font-semibold tracking-wide text-[var(--text)] transition hover:bg-[var(--accent-soft)]"
              style={{ borderColor: "var(--panel-border)" }}
              title={`Switch to ${density === "comfortable" ? "compact" : "comfortable"} density`}
            >
              {density === "comfortable" ? "COMFY" : "COMPACT"}
            </button>

            <button
              onClick={toggleDarkMode}
              className="rounded-xl border px-2.5 py-2 text-[var(--text)] transition hover:bg-[var(--accent-soft)]"
              style={{ borderColor: "var(--panel-border)" }}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {user?.name || "Admin"}
              </p>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                {user?.role || "staff"}
              </p>
            </div>

            <button
              onClick={onLogout}
              className="rounded-xl border px-3 py-1.5 text-sm font-medium transition hover:bg-[var(--accent-soft)]"
              style={{ borderColor: "var(--panel-border)", color: "var(--text)" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
