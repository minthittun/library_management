import { useEffect } from "react";
import useUIStore from "../store/useUIStore";

function Modal({ isOpen, onClose, title, children, type = "default", showClose = true }) {
  const darkMode = useUIStore((state) => state.darkMode);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const backdropStyle = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
  const modalBg = darkMode ? "#161b22" : "#ffffff";
  const modalBorder = darkMode ? "#30363d" : "#d0d7de";
  const textColor = darkMode ? "#fff" : "#111827";

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          headerBg: darkMode ? "bg-blue-900/30" : "bg-blue-50",
          headerBorder: darkMode ? "#166534" : "#bbf7d0",
          iconColor: darkMode ? "#4ade80" : "#16a34a",
          icon: "✓",
        };
      case "error":
        return {
          headerBg: darkMode ? "bg-red-900/30" : "bg-red-50",
          headerBorder: darkMode ? "#991b1b" : "#fecaca",
          iconColor: darkMode ? "#f87171" : "#dc2626",
          icon: "✕",
        };
      case "warning":
        return {
          headerBg: darkMode ? "bg-yellow-900/30" : "bg-yellow-50",
          headerBorder: darkMode ? "#854d0e" : "#fef08a",
          iconColor: darkMode ? "#fbbf24" : "#ca8a04",
          icon: "!",
        };
      case "confirm":
        return {
          headerBg: darkMode ? "bg-blue-900/30" : "bg-blue-50",
          headerBorder: darkMode ? "#1e40af" : "#bfdbfe",
          iconColor: darkMode ? "#60a5fa" : "#2563eb",
          icon: "?",
        };
      default:
        return {
          headerBg: darkMode ? "bg-[#161b22]" : "bg-gray-50",
          headerBorder: modalBorder,
          iconColor: textColor,
          icon: "",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className={backdropStyle} onClick={handleBackdropClick}>
      <div
        className={`border rounded-md w-full max-w-md overflow-hidden ${darkMode ? "text-white" : "text-gray-900"}`}
        style={{ backgroundColor: modalBg, borderColor: modalBorder }}
      >
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ backgroundColor: typeStyles.headerBg, borderColor: typeStyles.headerBorder }}
        >
          <div className="flex items-center gap-2">
            {type !== "default" && (
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ color: typeStyles.iconColor, borderColor: typeStyles.iconColor, border: "2px solid" }}
              >
                {typeStyles.icon}
              </span>
            )}
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>
              {title}
            </h2>
          </div>
          {showClose && (
            <button
              onClick={onClose}
              className={`text-lg font-bold ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
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
