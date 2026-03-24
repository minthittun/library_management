import Modal from "./Modal";
import useModalStore from "../store/useModalStore";

function ModalProvider() {
  const { isOpen, type, title, message, onConfirm, onClose } = useModalStore();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type={type}>
      <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>
        {message}
      </p>
      <div className="flex justify-end gap-3">
        {type === "confirm" ? (
          <>
            <button
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-[var(--accent-soft)]"
              style={{ borderColor: "var(--panel-border)", color: "var(--text)" }}
            >
              Cancel
            </button>
            <button onClick={onConfirm} className="glow-btn rounded-lg px-4 py-2 text-sm font-medium transition">
              Confirm
            </button>
          </>
        ) : (
          <button
            onClick={onClose || onConfirm}
            className="glow-btn rounded-lg px-4 py-2 text-sm font-medium transition"
          >
            OK
          </button>
        )}
      </div>
    </Modal>
  );
}

export default ModalProvider;
