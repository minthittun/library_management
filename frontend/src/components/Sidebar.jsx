import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useUIStore from "../store/useUIStore";
import useAuthStore from "../store/useAuthStore";

function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed } = useUIStore();
  const darkMode = useUIStore((state) => state.darkMode);
  const user = useAuthStore((state) => state.user);

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    if (location.pathname === "/books" || location.pathname === "/copies") {
      setLibraryOpen(true);
    }
    if (location.pathname === "/members" || location.pathname === "/payments") {
      setMembersOpen(true);
    }
    if (location.pathname === "/issue" || location.pathname === "/return" || location.pathname === "/borrow/report") {
      setBorrowOpen(true);
    }
    if (location.pathname === "/sales" || location.pathname === "/sales/report") {
      setSalesOpen(true);
    }
    if (location.pathname === "/admin/libraries" || location.pathname === "/admin/admins") {
      setAdminOpen(true);
    }
  }, [location.pathname]);

  const topLinks = [
    {
      path: "/",
      label: isSuperAdmin ? "Overview" : "Dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
  ];

  const superAdminLinks = [
    {
      path: "/admin/libraries",
      label: "Libraries",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    },
    {
      path: "/admin/admins",
      label: "Admins",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
  ];

  const libraryLinks = [
    {
      path: "/books",
      label: "Books",
      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    },
    {
      path: "/copies",
      label: "Copies",
      icon: "M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zm-2 4H3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2",
    },
  ];

  const isLibraryActive =
    location.pathname === "/books" || location.pathname === "/copies";
  const isMembersActive =
    location.pathname === "/members" || location.pathname === "/payments";
  const isBorrowActive =
    location.pathname === "/issue" || location.pathname === "/return" || location.pathname === "/borrow/report";
  const isSalesActive =
    location.pathname === "/sales" || location.pathname === "/sales/report";

  const membersLinks = [
    {
      path: "/members",
      label: "Members",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    },
    {
      path: "/payments",
      label: "Payments",
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    },
  ];

  const borrowLinks = [
    {
      path: "/issue",
      label: "Issue",
      icon: "M8 7h12m0 0l-4-4m4 4l-4 4",
    },
    {
      path: "/return",
      label: "Return",
      icon: "M4 17h12m0 0l-4 4m4-4l-4-4",
    },
    {
      path: "/borrow/report",
      label: "Report",
      icon: "M9 17v-2a2 2 0 114 0v2m-7 4h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
  ];
  const salesLinks = [
    {
      path: "/sales",
      label: "POS",
      icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0zM7 17a2 2 0 100-4 2 2 0 000 4z",
    },
    {
      path: "/sales/report",
      label: "Report",
      icon: "M9 17v-2a2 2 0 114 0v2m-7 4h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 border-r transition-all duration-200 ${
        darkMode ? "bg-[#010409] border-[#30363d]" : "bg-white border-[#d0d7de]"
      } ${sidebarCollapsed ? "w-16" : "w-72"}`}
    >
      <nav className="p-2">
        {topLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-colors ${
              location.pathname === link.path
                ? darkMode
                  ? "bg-blue-900/50 text-blue-400"
                  : "bg-blue-50 text-blue-600"
                : darkMode
                  ? "text-gray-400 hover:bg-gray-800 hover:text-gray300"
                  : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={link.icon}
              />
            </svg>
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">{link.label}</span>
            )}
            </Link>
          ))}

        {isSuperAdmin && (
          <>
            <button
              type="button"
              onClick={() => setAdminOpen((open) => !open)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-colors ${
                location.pathname === "/admin/libraries" || location.pathname === "/admin/admins"
                  ? darkMode
                    ? "bg-blue-900/50 text-blue-400"
                    : "bg-blue-50 text-blue-600"
                  : darkMode
                    ? "text-gray-400 hover:bg-gray-800 hover:text-gray300"
                    : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {!sidebarCollapsed && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">Admin</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      adminOpen ? "rotate-180" : "rotate-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </>
              )}
            </button>

            {adminOpen &&
              superAdminLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-colors ${
                    location.pathname === link.path
                      ? darkMode
                        ? "bg-blue-900/50 text-blue-400"
                        : "bg-blue-50 text-blue-600"
                      : darkMode
                        ? "text-gray-400 hover:bg-gray-800 hover:text-gray300"
                        : "text-gray-700 hover:bg-gray-100"
                  } ${sidebarCollapsed ? "" : "ml-4"}`}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={link.icon}
                    />
                  </svg>
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{link.label}</span>
                  )}
                </Link>
              ))}
          </>
        )}

        {!isSuperAdmin && (
          <>
            <button
              type="button"
              onClick={() => setMembersOpen((open) => !open)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-colors ${
                isMembersActive
              ? darkMode
                ? "bg-blue-900/50 text-blue-400"
                : "bg-blue-50 text-blue-600"
              : darkMode
                ? "text-gray-400 hover:bg-gray-800 hover:text-gray300"
                : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {!sidebarCollapsed && (
            <>
              <span className="text-sm font-medium flex-1 text-left">Members</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  membersOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </>
          )}
        </button>

        {membersOpen &&
          membersLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-colors ${
                location.pathname === link.path
                  ? darkMode
                    ? "bg-blue-900/50 text-blue-400"
                    : "bg-blue-50 text-blue-600"
                  : darkMode
                    ? "text-gray-400 hover:bg-gray-800 hover:text-gray300"
                    : "text-gray-700 hover:bg-gray-100"
              } ${sidebarCollapsed ? "" : "ml-4"}`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={link.icon}
                />
              </svg>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{link.label}</span>
              )}
            </Link>
          ))}

        <button
          type="button"
          onClick={() => setLibraryOpen((open) => !open)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-colors ${
            isLibraryActive
              ? darkMode
                ? "bg-blue-900/50 text-blue-400"
                : "bg-blue-50 text-blue-600"
              : darkMode
                ? "text-gray-400 hover:bg-gray-800 hover:text-gray300"
                : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          {!sidebarCollapsed && (
            <>
              <span className="text-sm font-medium flex-1 text-left">Library</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  libraryOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </>
          )}
        </button>

        {libraryOpen &&
          libraryLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-colors ${
                location.pathname === link.path
                  ? darkMode
                    ? "bg-blue-900/50 text-blue-400"
                    : "bg-blue-50 text-blue-600"
                  : darkMode
                    ? "text-gray-400 hover:bg-gray-800 hover:text-gray300"
                    : "text-gray-700 hover:bg-gray-100"
              } ${sidebarCollapsed ? "" : "ml-4"}`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={link.icon}
                />
              </svg>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{link.label}</span>
              )}
            </Link>
          ))}

        <button
          type="button"
          onClick={() => setBorrowOpen((open) => !open)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-colors ${
            isBorrowActive
              ? darkMode
                ? "bg-blue-900/50 text-blue-400"
                : "bg-blue-50 text-blue-600"
              : darkMode
                ? "text-gray-400 hover:bg-gray-800 hover:text-gray300"
                : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          {!sidebarCollapsed && (
            <>
              <span className="text-sm font-medium flex-1 text-left">Borrow</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  borrowOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </>
          )}
        </button>

        {borrowOpen &&
          borrowLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-colors ${
                location.pathname === link.path
                  ? darkMode
                    ? "bg-blue-900/50 text-blue-400"
                    : "bg-blue-50 text-blue-600"
                  : darkMode
                    ? "text-gray-400 hover:bg-gray-800 hover:text-gray300"
                    : "text-gray-700 hover:bg-gray-100"
              } ${sidebarCollapsed ? "" : "ml-4"}`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={link.icon}
                />
              </svg>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{link.label}</span>
              )}
            </Link>
          ))}

        <button
          type="button"
          onClick={() => setSalesOpen((open) => !open)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-colors ${
            isSalesActive
              ? darkMode
                ? "bg-blue-900/50 text-blue-400"
                : "bg-blue-50 text-blue-600"
              : darkMode
                ? "text-gray-400 hover:bg-gray-800 hover:text-gray300"
                : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0zM7 17a2 2 0 100-4 2 2 0 000 4z"
            />
          </svg>
          {!sidebarCollapsed && (
            <>
              <span className="text-sm font-medium flex-1 text-left">Sales</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  salesOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </>
          )}
        </button>

        {salesOpen &&
          salesLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-colors ${
                location.pathname === link.path
                  ? darkMode
                    ? "bg-blue-900/50 text-blue-400"
                    : "bg-blue-50 text-blue-600"
                  : darkMode
                    ? "text-gray-400 hover:bg-gray-800 hover:text-gray300"
                    : "text-gray-700 hover:bg-gray-100"
              } ${sidebarCollapsed ? "" : "ml-4"}`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={link.icon}
                />
              </svg>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{link.label}</span>
              )}
            </Link>
          ))}
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
