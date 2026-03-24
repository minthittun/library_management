import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useUIStore from "../store/useUIStore";
import useModalStore from "../store/useModalStore";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";

function Issue() {
  const {
    members,
    membersMeta,
    bookCopies,
    bookCopiesMeta,
    fetchMembers,
    fetchBookCopies,
    borrowBook,
  } = useStore();
  const darkMode = useUIStore((state) => state.darkMode);
  const showAlert = useModalStore((state) => state.showAlert);

  const [selectedCopy, setSelectedCopy] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(search, 300);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberPage, setMemberPage] = useState(1);
  const [memberLimit, setMemberLimit] = useState(10);
  const debouncedMemberSearch = useDebounce(memberSearch, 300);
  const isExpired = (expiryDate) =>
    expiryDate && new Date(expiryDate) < new Date();
  const eligibleMembers = members.filter(
    (member) =>
      member.status === "active" &&
      member.membershipExpiryDate &&
      !isExpired(member.membershipExpiryDate),
  );

  useEffect(() => {
    if (showIssueModal) {
      fetchMembers({
        page: memberPage,
        limit: memberLimit,
        search: debouncedMemberSearch,
        status: "active",
      });
    }
  }, [showIssueModal, memberPage, memberLimit, debouncedMemberSearch]);

  useEffect(() => {
    fetchBookCopies({
      page,
      limit,
      search: debouncedSearch,
      status: "available",
      type: "borrow",
    });
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    if (bookCopiesMeta.totalPages > 0 && page > bookCopiesMeta.totalPages) {
      setPage(bookCopiesMeta.totalPages);
    }
  }, [bookCopiesMeta.totalPages, page]);

  const handleIssue = async () => {
    if (!selectedMemberId || !selectedCopy?._id) {
      showAlert("Selection Required", "Please select a member.", "warning");
      return;
    }
    try {
      await borrowBook({
        memberId: selectedMemberId,
        bookCopyId: selectedCopy._id,
      });
      setShowIssueModal(false);
      setSelectedCopy(null);
      setSelectedMemberId("");
      setMemberSearch("");
      setMemberPage(1);
      setPage(1);
      fetchBookCopies({
        page: 1,
        limit,
        search: debouncedSearch,
        status: "available",
        type: "borrow",
      });
      showAlert("Success", "Book issued successfully!", "success");
    } catch (error) {
      showAlert("Error", error.response?.data?.message || "Error issuing book", "error");
    }
  };

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
  const buttonSecondary = `px-3 py-1 rounded-md text-sm font-medium border ${
    darkMode
      ? "border-gray-600 hover:bg-gray-800 text-gray-300"
      : "border-gray-300 hover:bg-gray-100 text-gray-700"
  }`;
  const buttonSelected = `px-3 py-1 rounded-md text-sm font-medium ${
    darkMode
      ? "bg-blue-600 text-white"
      : "bg-blue-600 text-white"
  }`;
  const buttonGhost = `px-4 py-2 rounded-md text-sm font-medium border ${
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
          Issue Book
        </h1>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className={inputStyle}
          placeholder="Scan or enter barcode to search"
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
              <th className={`${thClass} first:rounded-tl-md`}>Barcode</th>
              <th className={thClass}>Book</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} last:rounded-tr-md`}>Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {bookCopies?.map((copy, index) => (
              <tr
                key={copy._id}
                className={`${
                  darkMode ? "border-gray-700" : "border-gray-200"
                } border-b`}
              >
                <td
                  className={`${tdClass} ${
                    index === bookCopies.length - 1 ? "rounded-bl-md" : ""
                  }`}
                >
                  {copy.barcode}
                </td>
                <td className={tdClass}>{copy.book?.title || "N/A"}</td>
                <td className={tdClass}>{copy.type}</td>
                <td className={tdClass}>{copy.status}</td>
                <td className={tdClass}>
                  <button
                    type="button"
                    className={buttonSecondary}
                    onClick={() => {
                      setSelectedCopy(copy);
                      setShowIssueModal(true);
                      setSelectedMemberId("");
                      setMemberSearch("");
                      setMemberPage(1);
                    }}
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))}
            {bookCopies?.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={5}>
                  No available copies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={bookCopiesMeta.totalPages}
        total={bookCopiesMeta.total}
        limit={bookCopiesMeta.limit}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
        darkMode={darkMode}
      />

      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`border rounded-md p-6 w-full max-w-2xl overflow-hidden ${containerStyle}`}
            style={{ backgroundColor: tableBg, borderColor: tableBorder }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: darkMode ? "#ffffff" : "#111827" }}
            >
              Select Member
            </h2>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">
                Book: {selectedCopy?.book?.title || "N/A"} | Barcode:{" "}
                {selectedCopy?.barcode || "N/A"}
              </div>
              <input
                type="text"
                className={inputStyle}
                placeholder="Search member by name, phone, or address"
                value={memberSearch}
                onChange={(e) => {
                  setMemberSearch(e.target.value);
                  setMemberPage(1);
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
                    <th className={`${thClass} first:rounded-tl-md`}>Name</th>
                    <th className={thClass}>Phone</th>
                    <th className={thClass}>Expiry</th>
                    <th className={`${thClass} last:rounded-tr-md`}>Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {eligibleMembers.map((member, index) => (
                    <tr
                      key={member._id}
                      className={`${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      } border-b`}
                    >
                      <td
                        className={`${tdClass} ${
                          index === eligibleMembers.length - 1
                            ? "rounded-bl-md"
                            : ""
                        }`}
                      >
                        {member.name}
                      </td>
                      <td className={tdClass}>{member.phone}</td>
                      <td className={tdClass}>
                        {member.membershipExpiryDate
                          ? new Date(
                              member.membershipExpiryDate,
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className={tdClass}>
                        <button
                          type="button"
                          className={selectedMemberId === member._id ? buttonSelected : buttonSecondary}
                          onClick={() => setSelectedMemberId(member._id)}
                        >
                          {selectedMemberId === member._id
                            ? "Selected"
                            : "Select"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {eligibleMembers.length === 0 && (
                    <tr>
                      <td className={tdClass} colSpan={4}>
                        No eligible members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={memberPage}
              totalPages={membersMeta.totalPages}
              total={membersMeta.total}
              limit={membersMeta.limit}
              onPageChange={setMemberPage}
              onLimitChange={(value) => {
                setMemberLimit(value);
                setMemberPage(1);
              }}
              darkMode={darkMode}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowIssueModal(false);
                  setSelectedCopy(null);
                  setSelectedMemberId("");
                }}
                className={buttonGhost}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleIssue}
                className={buttonPrimary}
              >
                Issue Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Issue;
