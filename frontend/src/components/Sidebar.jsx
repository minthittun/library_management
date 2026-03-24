import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useUIStore from "../store/useUIStore";
import useAuthStore from "../store/useAuthStore";

const linkBase =
  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all";

function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === "superadmin";

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    if (["/books", "/copies"].includes(location.pathname)) setLibraryOpen(true);
    if (["/members", "/payments"].includes(location.pathname)) setMembersOpen(true);
    if (["/issue", "/return", "/borrow/report"].includes(location.pathname)) setBorrowOpen(true);
    if (["/sales", "/sales/report"].includes(location.pathname)) setSalesOpen(true);
    if (["/admin/libraries", "/admin/admins"].includes(location.pathname)) setAdminOpen(true);
  }, [location.pathname]);

  const menuSections = {
    admin: {
      open: adminOpen,
      setOpen: setAdminOpen,
      active: ["/admin/libraries", "/admin/admins"].includes(location.pathname),
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      label: "Admin",
      links: [
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
      ],
    },
    members: {
      open: membersOpen,
      setOpen: setMembersOpen,
      active: ["/members", "/payments"].includes(location.pathname),
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      label: "Members",
      links: [
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
      ],
    },
    library: {
      open: libraryOpen,
      setOpen: setLibraryOpen,
      active: ["/books", "/copies"].includes(location.pathname),
      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
      label: "Library",
      links: [
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
      ],
    },
    borrow: {
      open: borrowOpen,
      setOpen: setBorrowOpen,
      active: ["/issue", "/return", "/borrow/report"].includes(location.pathname),
      icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
      label: "Borrow",
      links: [
        { path: "/issue", label: "Issue", icon: "M8 7h12m0 0l-4-4m4 4l-4 4" },
        { path: "/return", label: "Return", icon: "M4 17h12m0 0l-4 4m4-4l-4-4" },
        {
          path: "/borrow/report",
          label: "Report",
          icon: "M9 17v-2a2 2 0 114 0v2m-7 4h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
        },
      ],
    },
    sales: {
      open: salesOpen,
      setOpen: setSalesOpen,
      active: ["/sales", "/sales/report"].includes(location.pathname),
      icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0zM7 17a2 2 0 100-4 2 2 0 000 4z",
      label: "Sales",
      links: [
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
      ],
    },
  };

  const renderIcon = (icon) => (
    <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
    </svg>
  );

  const navClasses = (active) =>
    `${linkBase} ${
      active
        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
        : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
    }`;

  const topLink = {
    path: "/",
    label: isSuperAdmin ? "Overview" : "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  };

  const renderGroup = ({ open, setOpen, active, icon, label, links }) => (
    <>
      <button type="button" onClick={() => setOpen((prev) => !prev)} className={`w-full ${navClasses(active)}`}>
        {renderIcon(icon)}
        {!sidebarCollapsed && (
          <>
            <span className="flex-1 text-left">{label}</span>
            <svg
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {open &&
        links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`${navClasses(location.pathname === link.path)} ${sidebarCollapsed ? "" : "ml-4"}`}
          >
            {renderIcon(link.icon)}
            {!sidebarCollapsed && <span>{link.label}</span>}
          </Link>
        ))}
    </>
  );

  return (
    <aside
      className={`fixed bottom-0 left-0 top-16 z-10 border-r panel transition-all duration-200 ${
        sidebarCollapsed ? "w-16" : "w-72"
      }`}
      style={{ borderColor: "var(--panel-border)" }}
    >
      <nav className="space-y-1 p-2">
        <Link to={topLink.path} className={navClasses(location.pathname === topLink.path)}>
          {renderIcon(topLink.icon)}
          {!sidebarCollapsed && <span>{topLink.label}</span>}
        </Link>

        {isSuperAdmin && renderGroup(menuSections.admin)}

        {!isSuperAdmin && (
          <>
            {renderGroup(menuSections.members)}
            {renderGroup(menuSections.library)}
            {renderGroup(menuSections.borrow)}
            {renderGroup(menuSections.sales)}
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
