import { useEffect } from "react";
import useUIStore from "../store/useUIStore";

function Navbar({ onLogout, user }) {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const darkMode = useUIStore((state) => state.darkMode);
  const toggleDarkMode = useUIStore((state) => state.toggleDarkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    }
  }, [darkMode]);

  return (
    <>
      <button
        onClick={toggleSidebar}
        className={`fixed top-3 z-20 p-2 rounded-md transition-colors ${
          darkMode
            ? "bg-gray-700 hover:bg-gray-600 text-gray-300 left-4"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700 left-4"
        }`}
      >
        {sidebarCollapsed ? (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        )}
      </button>
      <nav
        className={`border-b px-4 py-3 fixed top-0 left-0 right-0 z-10 ${
          darkMode
            ? "bg-[#010409] border-[#30363d] text-gray-300"
            : "bg-white border-[#d0d7de] text-gray-900"
        }`}
      >
        <div className={`flex items-center justify-between ml-12`}>
          <div className="flex items-center gap-2">
            <h1
              className="text-lg font-semibold"
              style={{ color: darkMode ? "#ffffff" : "#111827" }}
            >
              Library System
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-md transition-colors ${
                darkMode
                  ? "hover:bg-gray-800 text-gray-400"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {darkMode ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            <span
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-700"}`}
            >
              {user?.name || "Admin"}
            </span>
            <button
              onClick={onLogout}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
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
