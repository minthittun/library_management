import useUIStore from "../store/useUIStore";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  type = "default",
  showClose = true,
}) {
  const darkMode = useUIStore((state) => state.darkMode);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return { icon: "✓", tone: "#22c55e" };
      case "error":
        return { icon: "✕", tone: "var(--status-danger)" };
      case "warning":
        return { icon: "!", tone: "#f59e0b" };
      case "confirm":
        return { icon: "?", tone: "var(--accent)" };
      default:
        return { icon: "", tone: "var(--text)" };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={handleBackdropClick}>
      <div className="panel w-full max-w-md overflow-hidden rounded-2xl">
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: "var(--panel-border)", background: "var(--panel-solid)" }}
        >
          <div className="flex items-center gap-2">
            {type !== "default" && (
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full border text-sm font-bold"
                style={{ color: typeStyles.tone, borderColor: typeStyles.tone }}
              >
                {typeStyles.icon}
              </span>
            )}

            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              {title}
            </h2>
          </div>

          {showClose && (
            <button
              onClick={onClose}
              className="text-xl font-bold transition hover:opacity-70"
              style={{ color: darkMode ? "#94a3b8" : "#64748b" }}
            >
              ×
            </button>
          )}
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
