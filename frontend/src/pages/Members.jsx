import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useUIStore from "../store/useUIStore";
import useModalStore from "../store/useModalStore";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";

function Members() {
  const { members, membersMeta, fetchMembers, addMember, createPayment } =
    useStore();
  const darkMode = useUIStore((state) => state.darkMode);
  const showAlert = useModalStore((state) => state.showAlert);

  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [paymentForm, setPaymentForm] = useState({
    memberId: "",
    amount: "",
    monthsExtended: "6",
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchMembers({ page, limit, search: debouncedSearch });
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    if (membersMeta.totalPages > 0 && page > membersMeta.totalPages) {
      setPage(membersMeta.totalPages);
    }
  }, [membersMeta.totalPages, page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMember(form);
      setForm({ name: "", phone: "", address: "" });
      setShowModal(false);
      setPage(1);
      fetchMembers({ page: 1, limit, search: debouncedSearch });
      showAlert("Success", "Member added successfully!", "success");
    } catch (error) {
      showAlert(
        "Error",
        error.response?.data?.message || "Error adding member",
        "error",
      );
    }
  };

  const openPaymentModal = (memberId) => {
    setPaymentForm({ memberId, amount: "", monthsExtended: "6" });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPayment({
        memberId: paymentForm.memberId,
        amount: parseFloat(paymentForm.amount),
        monthsExtended: parseInt(paymentForm.monthsExtended, 10),
      });
      setShowPaymentModal(false);
      setPage(1);
      fetchMembers({ page: 1, limit, search: debouncedSearch });
      showAlert("Success", "Payment processed successfully!", "success");
    } catch (error) {
      showAlert(
        "Error",
        error.response?.data?.message || "Error processing payment",
        "error",
      );
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "N/A";
  const calculateMonths = (startDate, expiryDate) => {
    if (!startDate || !expiryDate) return "-";
    const start = new Date(startDate);
    const expiry = new Date(expiryDate);
    const months =
      (expiry.getFullYear() - start.getFullYear()) * 12 +
      (expiry.getMonth() - start.getMonth());
    return months > 0 ? `${months} months` : "-";
  };
  const isExpired = (expiryDate) =>
    expiryDate && new Date(expiryDate) < new Date();
  const needsMembership = (member) =>
    !member.membershipExpiryDate || isExpired(member.membershipExpiryDate);
  const isSuspended = (member) => member.status === "suspended";

  // Styles
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
          Members
        </h1>
        <button onClick={() => setShowModal(true)} className={buttonPrimary}>
          Add Member
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, phone, address, or status"
          className={inputStyle}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Members Table */}
      <div
        className={`rounded-md border overflow-hidden ${containerStyle}`}
        style={{ backgroundColor: tableBg, borderColor: tableBorder }}
      >
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr
              className={`${darkMode ? "bg-[#161b22] text-gray-400" : "bg-gray-50 text-gray-500"}`}
            >
              <th className={`${thClass} first:rounded-tl-md`}>Name</th>
              <th className={thClass}>Phone</th>
              <th className={thClass}>Address</th>
              <th className={thClass}>Start Date</th>
              <th className={thClass}>Expiry Date</th>
              <th className={thClass}>Duration</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} last:rounded-tr-md`}>Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {members?.map((member, index) => (
              <tr
                key={member._id}
                className={`${darkMode ? "border-gray-700" : "border-gray-200"} border-b`}
              >
                <td
                  className={`${tdClass} ${index === members.length - 1 ? "rounded-bl-md" : ""}`}
                >
                  {member.name}
                </td>
                <td className={tdClass}>{member.phone}</td>
                <td className={tdClass}>{member.address}</td>
                <td className={tdClass}>
                  {formatDate(member.membershipStartDate)}
                </td>
                <td className={tdClass}>
                  {formatDate(member.membershipExpiryDate)}
                </td>
                <td className={tdClass}>
                  {calculateMonths(
                    member.membershipStartDate,
                    member.membershipExpiryDate,
                  )}
                </td>
                <td
                  className={`
                  ${tdClass}
                `}
                >
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      isSuspended(member)
                        ? darkMode
                          ? "bg-yellow-900/50 text-yellow-300"
                          : "bg-yellow-100 text-yellow-700"
                        : member.status === "active"
                          ? darkMode
                            ? "bg-blue-900/50 text-blue-400"
                            : "bg-blue-100 text-blue-700"
                          : darkMode
                            ? "bg-red-900/50 text-red-400"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isSuspended(member)
                      ? "Suspended"
                      : !member.membershipExpiryDate
                        ? "No Membership"
                        : isExpired(member.membershipExpiryDate)
                          ? "Expired"
                          : "Active"}
                  </span>
                </td>
                <td
                  className={`${tdClass} ${index === members.length - 1 ? "rounded-br-md" : ""}`}
                >
                  {needsMembership(member) && !isSuspended(member) ? (
                    <button
                      className={buttonPrimary}
                      onClick={() => openPaymentModal(member._id)}
                    >
                      Membership Payment
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={membersMeta.totalPages}
        total={membersMeta.total}
        limit={membersMeta.limit}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
        darkMode={darkMode}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`border rounded-md p-6 w-full max-w-lg overflow-hidden ${containerStyle}`}
            style={{ backgroundColor: tableBg, borderColor: tableBorder }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: darkMode ? "#ffffff" : "#111827" }}
            >
              Add New Member
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                className={inputStyle}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                className={inputStyle}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <textarea
                placeholder="Address"
                className={inputStyle}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={buttonSecondary}
                >
                  Cancel
                </button>
                <button type="submit" className={buttonPrimary}>
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Membership Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`border rounded-md p-6 w-full max-w-lg overflow-hidden ${containerStyle}`}
            style={{ backgroundColor: tableBg, borderColor: tableBorder }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: darkMode ? "#ffffff" : "#111827" }}
            >
              Membership Payment
            </h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-3">
              <input
                type="number"
                placeholder="Amount"
                className={inputStyle}
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: e.target.value })
                }
                required
              />
              <select
                className={inputStyle}
                value={paymentForm.monthsExtended}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    monthsExtended: e.target.value,
                  })
                }
              >
                <option value="6">6 months</option>
                <option value="12">12 months</option>
              </select>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className={buttonSecondary}
                >
                  Cancel
                </button>
                <button type="submit" className={buttonPrimary}>
                  Process Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;
