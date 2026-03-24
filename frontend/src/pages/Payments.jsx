import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useUIStore from "../store/useUIStore";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";

function Payments() {
  const { payments, paymentsMeta, fetchPayments } = useStore();
  const darkMode = useUIStore((state) => state.darkMode);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchPayments({ page, limit, search: debouncedSearch });
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    if (paymentsMeta.totalPages > 0 && page > paymentsMeta.totalPages) {
      setPage(paymentsMeta.totalPages);
    }
  }, [paymentsMeta.totalPages, page]);

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

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: darkMode ? "#ffffff" : "#111827" }}
        >
          Membership Payments
        </h1>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by member name"
          className={inputStyle}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Payments Table */}
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
              <th className={thClass}>Amount</th>
              <th className={thClass}>Months Extended</th>
              <th className={`${thClass} last:rounded-tr-md`}>Payment Date</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {payments?.map((payment, index) => (
              <tr
                key={payment._id}
                className={`${darkMode ? "border-gray-700" : "border-gray-200"} border-b`}
              >
                <td
                  className={`${tdClass} ${index === payments.length - 1 ? "rounded-bl-md" : ""}`}
                >
                  {payment.member?.name || "N/A"}
                </td>
                <td className={tdClass}>MMK {payment.amount?.toFixed(2)}</td>
                <td className={tdClass}>{payment.monthsExtended} months</td>
                <td
                  className={`${tdClass} ${index === payments.length - 1 ? "rounded-br-md" : ""}`}
                >
                  {formatDate(payment.paymentDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={paymentsMeta.totalPages}
        total={paymentsMeta.total}
        limit={paymentsMeta.limit}
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

export default Payments;
