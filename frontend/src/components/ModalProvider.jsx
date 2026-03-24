import Modal from "./Modal";
import useModalStore from "../store/useModalStore";

function ModalProvider() {
  const { isOpen, type, title, message, onConfirm, onClose } = useModalStore();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={type}
    >
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{message}</p>
      <div className="flex justify-end gap-3">
        {type === "confirm" ? (
          <>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white"
            >
              Confirm
            </button>
          </>
        ) : (
          <button
            onClick={onClose || onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white"
          >
            OK
          </button>
        )}
      </div>
    </Modal>
  );
}

export default ModalProvider;
