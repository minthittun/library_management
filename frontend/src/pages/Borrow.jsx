import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useUIStore from "../store/useUIStore";
import useModalStore from "../store/useModalStore";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";

function Borrow() {
  const {
    members,
    borrowRecords,
    borrowMeta,
    fetchMembers,
    fetchBorrowRecords,
    fetchBorrowOptions,
    fetchAvailableCopies,
    borrowBook,
    returnBook,
  } = useStore();

  const darkMode = useUIStore((state) => state.darkMode);
  const showAlert = useModalStore((state) => state.showAlert);

  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [borrowForm, setBorrowForm] = useState({
    memberId: "",
    bookCopyId: "",
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [bookCopies, setBookCopies] = useState([]);
  const [borrowOptions, setBorrowOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchMembers({ page: 1, limit: 1000, status: "active" });
  }, []);

  useEffect(() => {
    fetchBorrowRecords({ page, limit, search: debouncedSearch });
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchAvailableCopies({ type: "borrow" })
      .then(setBookCopies)
      .catch(console.error);
    fetchBorrowOptions({ page: 1, limit: 1000, status: "borrowed" })
      .then(setBorrowOptions)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (borrowMeta.totalPages > 0 && page > borrowMeta.totalPages) {
      setPage(borrowMeta.totalPages);
    }
  }, [borrowMeta.totalPages, page]);

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    try {
      await borrowBook(borrowForm);
      setBorrowForm({ memberId: "", bookCopyId: "" });
      setShowBorrowModal(false);
      setPage(1);
      fetchBorrowRecords({ page: 1, limit, search: debouncedSearch });
      fetchAvailableCopies({ type: "borrow" }).then(setBookCopies);
      fetchBorrowOptions({ page: 1, limit: 1000, status: "borrowed" }).then(
        setBorrowOptions,
      );
      showAlert("Success", "Book borrowed successfully!", "success");
    } catch (error) {
      showAlert("Error", error.response?.data?.message || "Error borrowing book", "error");
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      await returnBook(selectedRecord._id);
      setSelectedRecord(null);
      setShowReturnModal(false);
      setPage(1);
      fetchBorrowRecords({ page: 1, limit, search });
      fetchAvailableCopies({ type: "borrow" }).then(setBookCopies);
      fetchBorrowOptions({ page: 1, limit: 1000, status: "borrowed" }).then(
        setBorrowOptions,
      );
      showAlert("Success", "Book returned successfully!", "success");
    } catch (error) {
      showAlert("Error", error.response?.data?.message || "Error returning book", "error");
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

  // Styles
  const containerStyle = darkMode ? "text-white" : "text-gray-900";
  const tableBg = darkMode ? "#161b22" : "#ffffff";
  const tableBorder = darkMode ? "#30363d" : "#d0d7de";
  const thClass = "px-4 py-3 text-left font-medium";
  const tdClass = "px-4 py-3";
  const inputStyle = `w-full px-3 py-2 rounded-md border ${
    darkMode
      ? "bg-[#0d1117] border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900"
  }`;
  const buttonPrimary = `px-4 py-2 rounded-md text-sm font-medium ${
    darkMode
      ? "bg-blue-600 hover:bg-blue-500 text-white"
      : "bg-blue-600 hover:bg-blue-500 text-white"
  }`;
  const buttonSecondary = `px-4 py-2 rounded-md text-sm font-medium border ${
    darkMode
      ? "border-gray-600 hover:bg-gray-800 text-gray-300"
      : "border-gray-300 hover:bg-gray-100 text-gray-700"
  }`;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: darkMode ? "#ffffff" : "#111827" }}
        >
          Borrow & Return
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBorrowModal(true)}
            className={buttonPrimary}
          >
            Issue Book
          </button>
          <button
            onClick={() => setShowReturnModal(true)}
            className={buttonPrimary}
          >
            Return Book
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by member, book, or status"
          className={inputStyle}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Borrow Records Table */}
      <div
        className={`rounded-md border overflow-hidden ${containerStyle}`}
        style={{ backgroundColor: tableBg, borderColor: tableBorder }}
      >
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr
              className={
                darkMode
                  ? "bg-[#161b22] text-gray-400"
                  : "bg-gray-50 text-gray-500"
              }
            >
              <th className={`${thClass} first:rounded-tl-md`}>Member</th>
              <th className={thClass}>Book</th>
              <th className={thClass}>Barcode</th>
              <th className={thClass}>Borrow Date</th>
              <th className={thClass}>Due Date</th>
              <th className={thClass}>Return Date</th>
              <th className={`${thClass} last:rounded-tr-md`}>Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {borrowRecords?.map((record, index) => (
              <tr
                key={record._id}
                className={`${darkMode ? "border-gray-700" : "border-gray-200"} border-b`}
              >
                <td
                  className={`${tdClass} ${index === borrowRecords.length - 1 ? "rounded-bl-md" : ""}`}
                >
                  {record.member?.name || "N/A"}
                </td>
                <td className={tdClass}>
                  {record.bookCopy?.book?.title || "N/A"}
                </td>
                <td className={tdClass}>{record.bookCopy?.barcode || "N/A"}</td>
                <td className={tdClass}>{formatDate(record.borrowDate)}</td>
                <td className={tdClass}>{formatDate(record.dueDate)}</td>
                <td className={tdClass}>{formatDate(record.returnDate)}</td>
                <td className={tdClass}>{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={borrowMeta.totalPages}
        total={borrowMeta.total}
        limit={borrowMeta.limit}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
        darkMode={darkMode}
      />

      {/* Borrow Modal */}
      {showBorrowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`border rounded-md p-6 w-full max-w-lg overflow-hidden ${containerStyle}`}
            style={{ backgroundColor: tableBg, borderColor: tableBorder }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: darkMode ? "#ffffff" : "#111827" }}
            >
              Issue Book
            </h2>
            <form onSubmit={handleBorrowSubmit} className="space-y-3">
              <select
                className={inputStyle}
                value={borrowForm.memberId}
                onChange={(e) =>
                  setBorrowForm({ ...borrowForm, memberId: e.target.value })
                }
                required
              >
                <option value="">Select Member</option>
                {members
                  ?.filter((m) => m.status === "active")
                  .map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
              </select>
              <select
                className={inputStyle}
                value={borrowForm.bookCopyId}
                onChange={(e) =>
                  setBorrowForm({ ...borrowForm, bookCopyId: e.target.value })
                }
                required
              >
                <option value="">Select Book Copy</option>
                {bookCopies?.map((copy) => (
                  <option key={copy._id} value={copy._id}>
                    {copy.book?.title} - {copy.barcode}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowBorrowModal(false)}
                  className={buttonSecondary}
                >
                  Cancel
                </button>
                <button type="submit" className={buttonPrimary}>
                  Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`border rounded-md p-6 w-full max-w-lg overflow-hidden ${containerStyle}`}
            style={{ backgroundColor: tableBg, borderColor: tableBorder }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: darkMode ? "#ffffff" : "#111827" }}
            >
              Return Book
            </h2>
            <form onSubmit={handleReturnSubmit} className="space-y-3">
              <select
                className={inputStyle}
                value={selectedRecord?._id || ""}
                onChange={(e) =>
                  setSelectedRecord(
                    borrowRecords.find((r) => r._id === e.target.value),
                  )
                }
                required
              >
                <option value="">Select Borrow Record</option>
                {borrowOptions?.map((record) => (
                  <option key={record._id} value={record._id}>
                    {record.member?.name} - {record.bookCopy?.book?.title}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReturnModal(false);
                    setSelectedRecord(null);
                  }}
                  className={buttonSecondary}
                >
                  Cancel
                </button>
                <button type="submit" className={buttonPrimary}>
                  Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Borrow;
