import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useUIStore from "../store/useUIStore";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";

function SalesReport() {
  const { sales, salesMeta, fetchSales } = useStore();
  const darkMode = useUIStore((state) => state.darkMode);

  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchSales({
      page,
      limit,
      search: debouncedSearch,
      from,
      to,
    });
  }, [page, limit, debouncedSearch, from, to]);

  useEffect(() => {
    if (salesMeta.totalPages > 0 && page > salesMeta.totalPages) {
      setPage(salesMeta.totalPages);
    }
  }, [salesMeta.totalPages, page]);

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
          Sales Report
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          type="text"
          placeholder="Search book or sold by"
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
              <th className={thClass}>Price</th>
              <th className={thClass}>Pay Amount</th>
              <th className={thClass}>Change</th>
              <th className={thClass}>Sold Date</th>
              <th className={`${thClass} last:rounded-tr-md`}>Sold By</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {sales?.map((sale, index) => (
              <tr
                key={sale._id}
                className={`${
                  darkMode ? "border-gray-700" : "border-gray-200"
                } border-b`}
              >
                <td
                  className={`${tdClass} ${
                    index === sales.length - 1 ? "rounded-bl-md" : ""
                  }`}
                >
                  {sale.bookCopy?.book?.title || "N/A"}
                </td>
                <td className={tdClass}>{sale.bookCopy?.barcode || "N/A"}</td>
                <td className={tdClass}>MMK {sale.price?.toFixed(2)}</td>
                <td className={tdClass}>
                  MMK {sale.payAmount?.toFixed(2) || "0.00"}
                </td>
                <td className={tdClass}>
                  MMK {sale.change?.toFixed(2) || "0.00"}
                </td>
                <td className={tdClass}>{formatDate(sale.soldDate)}</td>
                <td className={tdClass}>{sale.soldBy}</td>
              </tr>
            ))}
            {sales?.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={7}>
                  No sales found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={salesMeta.totalPages}
        total={salesMeta.total}
        limit={salesMeta.limit}
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

export default SalesReport;
