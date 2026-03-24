import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useUIStore from "../store/useUIStore";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";

function Return() {
  const { borrowRecords, borrowMeta, fetchBorrowRecords, returnBook } =
    useStore();
  const darkMode = useUIStore((state) => state.darkMode);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(search, 300);

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
    } catch (error) {
      alert(error.response?.data?.message || "Error returning book");
    }
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
      </div>

      <div className="mb-4">
        <input
          type="text"
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
              <th className={`${thClass} first:rounded-tl-md`}>Member</th>
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
                <td className={tdClass} colSpan={6}>
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
