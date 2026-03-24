import { useEffect, useMemo, useRef, useState } from "react";
import useStore from "../store/useStore";
import useUIStore from "../store/useUIStore";
import useModalStore from "../store/useModalStore";
import useDebounce from "../hooks/useDebounce";
import SearchableSelect from "../components/SearchableSelect";

function Issue() {
  const {
    members,
    fetchMembers,
    fetchBookCopies,
    borrowBook,
  } = useStore();
  const darkMode = useUIStore((state) => state.darkMode);
  const showAlert = useModalStore((state) => state.showAlert);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [cart, setCart] = useState([]);
  const [issuing, setIssuing] = useState(false);
  const searchInputRef = useRef(null);

  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    fetchMembers({ page: 1, limit: 1000, status: "active" });
  }, []);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!debouncedSearch) {
        setResults([]);
        return;
      }
      try {
        const data = await fetchBookCopies({
          page: 1,
          limit: 50,
          search: debouncedSearch,
          status: "available",
          type: "borrow",
        });
        setResults(data || []);
      } catch {
        setResults([]);
      }
    };
    load();
  }, [debouncedSearch]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const exact = results.find((r) => r.barcode === search.trim());
      if (exact) {
        addToCart(exact);
        setSearch("");
        setResults([]);
      }
    }
  };

  const isExpired = (expiryDate) =>
    expiryDate && new Date(expiryDate) < new Date();

  const eligibleMembers = useMemo(
    () =>
      (members || []).filter(
        (member) =>
          member.status === "active" &&
          member.membershipExpiryDate &&
          !isExpired(member.membershipExpiryDate),
      ),
    [members],
  );

  const selectedMember = eligibleMembers.find((m) => m._id === selectedMemberId);

  const addToCart = (copy) => {
    setCart((prev) => {
      if (prev.some((item) => item._id === copy._id)) {
        return prev;
      }
      return [...prev, copy];
    });
    setSearch("");
    setResults([]);
  };

  const removeFromCart = (copyId) => {
    setCart((prev) => prev.filter((item) => item._id !== copyId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleIssueSelected = async () => {
    if (!selectedMemberId) {
      showAlert("Member Required", "Please select a member first.", "warning");
      return;
    }
    if (!cart.length) {
      showAlert("Cart Empty", "Please add at least one book copy.", "warning");
      return;
    }

    setIssuing(true);

    try {
      const results = await Promise.allSettled(
        cart.map((copy) =>
          borrowBook({
            memberId: selectedMemberId,
            bookCopyId: copy._id,
          }),
        ),
      );

      const successCount = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected");

      if (successCount > 0) {
        const successfulIds = results
          .map((r, idx) => (r.status === "fulfilled" ? cart[idx]._id : null))
          .filter(Boolean);

        setCart((prev) => prev.filter((copy) => !successfulIds.includes(copy._id)));
        setSelectedMemberId("");

        await fetchBookCopies({
          page: 1,
          limit: 50,
          search: debouncedSearch,
          status: "available",
          type: "borrow",
        });
      }

      if (failed.length === 0) {
        showAlert("Success", `${successCount} book(s) issued successfully.`, "success");
      } else {
        const details = failed
          .slice(0, 3)
          .map((f) => f.reason?.response?.data?.message || f.reason?.message || "Unknown error")
          .join(" | ");

        showAlert(
          "Partial Success",
          `${successCount} issued, ${failed.length} failed. ${details}`,
          failed.length === cart.length ? "error" : "warning",
        );
      }
    } catch (error) {
      showAlert(
        "Error",
        error.response?.data?.message || "Error issuing selected books",
        "error",
      );
    } finally {
      setIssuing(false);
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
  } disabled:opacity-60`;
  const buttonSecondary = `px-3 py-1 rounded-md text-sm font-medium border ${
    darkMode
      ? "border-gray-600 hover:bg-gray-800 text-gray-300"
      : "border-gray-300 hover:bg-gray-100 text-gray-700"
  }`;
  const buttonDanger = `px-3 py-1 rounded-md text-sm font-medium ${
    darkMode
      ? "bg-red-600 hover:bg-red-500 text-white"
      : "bg-red-600 hover:bg-red-500 text-white"
  }`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>
          Issue Book (POS)
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <input
              type="text"
              ref={searchInputRef}
              className={inputStyle}
              placeholder="Scan barcode or search title"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              onKeyDown={handleSearchKeyDown}
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
                    darkMode ? "bg-[#161b22] text-gray-400" : "bg-gray-50 text-gray-500"
                  }
                >
                  <th className={`${thClass} first:rounded-tl-md`}>Barcode</th>
                  <th className={thClass}>Book</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} last:rounded-tr-md`}>Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(results || []).map((copy, index) => {
                  const inCart = cart.some((item) => item._id === copy._id);
                  return (
                    <tr
                      key={copy._id}
                      className={`${darkMode ? "border-gray-700" : "border-gray-200"} border-b`}
                    >
                      <td
                        className={`${tdClass} ${
                          index === results.length - 1 ? "rounded-bl-md" : ""
                        }`}
                      >
                        {copy.barcode}
                      </td>
                      <td className={tdClass}>{copy.book?.title || "N/A"}</td>
                      <td className={tdClass}>{copy.status}</td>
                      <td className={tdClass}>
                        <button
                          type="button"
                          className={inCart ? buttonSecondary : buttonPrimary}
                          onClick={() => addToCart(copy)}
                          disabled={inCart}
                        >
                          {inCart ? "Added" : "Add"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {results.length === 0 && (
                  <tr>
                    <td className={tdClass} colSpan={4}>
                      {debouncedSearch
                        ? "No matching available copies found."
                        : "Scan barcode or search to add items."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div
            className={`rounded-md border overflow-hidden ${containerStyle}`}
            style={{ backgroundColor: tableBg, borderColor: tableBorder }}
          >
            <div className="p-4 border-b" style={{ borderColor: tableBorder }}>
              <div className="text-lg font-semibold">Issue Cart ({cart.length})</div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Member</label>
                <SearchableSelect
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  options={eligibleMembers}
                  placeholder="Select member"
                  searchPlaceholder="Search member by name or phone"
                  renderOption={(member) => (
                    <div className="flex flex-col">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-xs text-gray-500">
                        {member.phone} | Expires {new Date(member.membershipExpiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  filterFn={(member, query) => {
                    const q = query.toLowerCase();
                    return (
                      member.name?.toLowerCase().includes(q) ||
                      member.phone?.toLowerCase().includes(q)
                    );
                  }}
                />
                {selectedMember && (
                  <div className="text-xs text-gray-500 mt-2">
                    Selected: {selectedMember.name}
                  </div>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.book?.title || "N/A"}</div>
                      <div className="text-xs text-gray-500">{item.barcode}</div>
                    </div>
                    <button
                      type="button"
                      className={buttonDanger}
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="text-sm text-gray-500">No copies in cart.</div>
                )}
              </div>
            </div>

            <div className="p-4 border-t" style={{ borderColor: tableBorder }}>
              <div className="text-sm text-gray-500 mb-3">
                Ready to issue: <span className="font-semibold">{cart.length}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={clearCart}
                  disabled={!cart.length || issuing}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className={buttonPrimary}
                  onClick={handleIssueSelected}
                  disabled={!cart.length || !selectedMemberId || issuing}
                >
                  {issuing ? "Issuing..." : "Issue Selected"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Issue;
