import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useUIStore from "../store/useUIStore";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";

function BorrowReport() {
  const { borrowRecords, borrowMeta, fetchBorrowRecords } = useStore();
  const darkMode = useUIStore((state) => state.darkMode);

  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchBorrowRecords({
      page,
      limit,
      search: debouncedSearch,
      from,
      to,
      status: status || undefined,
    });
  }, [page, limit, debouncedSearch, from, to, status]);

  useEffect(() => {
    if (borrowMeta.totalPages > 0 && page > borrowMeta.totalPages) {
      setPage(borrowMeta.totalPages);
    }
  }, [borrowMeta.totalPages, page]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: darkMode ? "#ffffff" : "#111827" }}
        >
          Borrow Report
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <input
          type="text"
          placeholder="Search book, member..."
          className={inputStyle}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <input
          type="date"
          className={inputStyle}
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(1);
          }}
        />
        <input
          type="date"
          className={inputStyle}
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(1);
          }}
        />
        <select
          className={inputStyle}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="borrowed">Borrowed</option>
          <option value="returned">Returned</option>
        </select>
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
              <th className={`${thClass} first:rounded-tl-md`}>Book</th>
              <th className={thClass}>Barcode</th>
              <th className={thClass}>Member</th>
              <th className={thClass}>Issue Date</th>
              <th className={thClass}>Due Date</th>
              <th className={thClass}>Return Date</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} last:rounded-tr-md`}>Issued By</th>
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
                  {record.bookCopy?.book?.title || "N/A"}
                </td>
                <td className={tdClass}>{record.bookCopy?.barcode || "N/A"}</td>
                <td className={tdClass}>{record.member?.name || "N/A"}</td>
                <td className={tdClass}>{formatDate(record.borrowDate)}</td>
                <td className={tdClass}>{formatDate(record.dueDate)}</td>
                <td className={tdClass}>{formatDate(record.returnDate)}</td>
                <td className={tdClass}>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      record.status === "borrowed"
                        ? darkMode
                          ? "bg-yellow-900/50 text-yellow-400"
                          : "bg-yellow-100 text-yellow-700"
                        : darkMode
                          ? "bg-green-900/50 text-green-400"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className={tdClass}>
                  {record.issuedByName || record.issuedBy?.name || "N/A"}
                </td>
              </tr>
            ))}
            {borrowRecords?.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={8}>
                  No borrow records found.
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

export default BorrowReport;
