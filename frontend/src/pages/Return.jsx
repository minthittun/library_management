import { useEffect, useRef, useState } from "react";
import useStore from "../store/useStore";
import useUIStore from "../store/useUIStore";
import useModalStore from "../store/useModalStore";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";

function Return() {
  const { borrowRecords, borrowMeta, fetchBorrowRecords, returnBook, returnBooks } =
    useStore();
  const darkMode = useUIStore((state) => state.darkMode);
  const showAlert = useModalStore((state) => state.showAlert);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(search, 500);
  const searchInputRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    fetchBorrowRecords({
      page,
      limit,
      search: debouncedSearch,
      status: "borrowed",
    });
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    if (borrowMeta.totalPages > 0 && page > borrowMeta.totalPages) {
      setPage(borrowMeta.totalPages);
    }
  }, [borrowMeta.totalPages, page]);

  useEffect(() => {
    setSelectedIds([]);
    setSelectedMemberId(null);
  }, [borrowRecords]);

  const handleReturn = async (recordId) => {
    try {
      await returnBook(recordId);
      setPage(1);
      fetchBorrowRecords({
        page: 1,
        limit,
        search: debouncedSearch,
        status: "borrowed",
      });
      showAlert("Success", "Book returned successfully!", "success");
    } catch (error) {
      showAlert(
        "Error",
        error.response?.data?.message || "Error returning book",
        "error",
      );
    }
  };

  const handleBulkReturn = async () => {
    if (selectedIds.length === 0) {
      showAlert("No Selection", "Select at least one record to return.", "warning");
      return;
    }
    try {
      const result = await returnBooks(selectedIds);
      setSelectedIds([]);
      setPage(1);
      fetchBorrowRecords({
        page: 1,
        limit,
        search: debouncedSearch,
        status: "borrowed",
      });
      showAlert(
        "Success",
        `Returned ${result.returned} record(s). Skipped ${result.skipped}.`,
        "success",
      );
    } catch (error) {
      showAlert(
        "Error",
        error.response?.data?.message || "Error returning books",
        "error",
      );
    }
  };

  const allSelected =
    borrowRecords?.length > 0 &&
    borrowRecords.every((record) => selectedIds.includes(record._id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      setSelectedMemberId(null);
    } else {
      const firstMemberId =
        borrowRecords?.[0]?.member?._id || borrowRecords?.[0]?.member || null;
      if (!firstMemberId) {
        showAlert("No Member", "Selected records must have a member.", "warning");
        return;
      }
      const allowedMemberId = selectedMemberId || firstMemberId;
      const ids = borrowRecords
        .filter((record) => {
          const memberId = record.member?._id || record.member || null;
          return memberId === allowedMemberId;
        })
        .map((record) => record._id);
      setSelectedIds(ids);
      setSelectedMemberId(allowedMemberId);
    }
  };

  const toggleSelectOne = (recordId) => {
    const record = borrowRecords.find((item) => item._id === recordId);
    const memberId = record?.member?._id || record?.member || null;
    setSelectedIds((prev) => {
      if (prev.includes(recordId)) {
        const next = prev.filter((id) => id !== recordId);
        if (next.length === 0) setSelectedMemberId(null);
        return next;
      }
      if (selectedMemberId && memberId !== selectedMemberId) {
        showAlert(
          "Member Mismatch",
          "You can only return books for one member at a time.",
          "warning",
        );
        return prev;
      }
      if (!selectedMemberId) setSelectedMemberId(memberId);
      return [...prev, recordId];
    });
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

  const containerStyle = darkMode ? "text-white" : "text-gray-900";
  const tableBg = darkMode ? "#161b22" : "#ffffff";
  const tableBorder = darkMode ? "#30363d" : "#d0d7de";
  const thClass = "px-4 py-3 text-left font-medium";
  const tdClass = "px-4 py-3";
  const inputStyle = `w-full px-3 py-2 rounded-md border ${
    darkMode
      ? "bg-[#0d1117] border-gray-600 text-white placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  }`;
  const buttonPrimary = `px-3 py-1 rounded-md text-sm font-medium border ${
    darkMode
      ? "border-gray-600 hover:bg-gray-800 text-gray-300"
      : "border-gray-300 hover:bg-gray-100 text-gray-700"
  }`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: darkMode ? "#ffffff" : "#111827" }}
        >
          Return Book
        </h1>
        <button
          type="button"
          className={buttonPrimary}
          onClick={handleBulkReturn}
          disabled={selectedIds.length === 0}
        >
          Return Selected ({selectedIds.length})
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          ref={searchInputRef}
          placeholder="Scan barcode or search by member, book, or status"
          className={inputStyle}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

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
              <th className={`${thClass} first:rounded-tl-md`}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className={thClass}>Member</th>
              <th className={thClass}>Book</th>
              <th className={thClass}>Barcode</th>
              <th className={thClass}>Borrow Date</th>
              <th className={thClass}>Due Date</th>
              <th className={`${thClass} last:rounded-tr-md`}>Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {borrowRecords?.map((record, index) => (
              <tr
                key={record._id}
                className={`${
                  darkMode ? "border-gray-700" : "border-gray-200"
                } border-b`}
              >
                <td
                  className={`${tdClass} ${
                    index === borrowRecords.length - 1 ? "rounded-bl-md" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(record._id)}
                    onChange={() => toggleSelectOne(record._id)}
                  />
                </td>
                <td className={tdClass}>
                  {record.member?.name || "N/A"}
                </td>
                <td className={tdClass}>
                  {record.bookCopy?.book?.title || "N/A"}
                </td>
                <td className={tdClass}>{record.bookCopy?.barcode || "N/A"}</td>
                <td className={tdClass}>{formatDate(record.borrowDate)}</td>
                <td className={tdClass}>{formatDate(record.dueDate)}</td>
                <td className={tdClass}>
                  <button
                    type="button"
                    className={buttonPrimary}
                    onClick={() => handleReturn(record._id)}
                  >
                    Return
                  </button>
                </td>
              </tr>
            ))}
            {borrowRecords?.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={7}>
                  No borrowed records found.
                </td>
              </tr>
            )}
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
    </div>
  );
}

export default Return;
