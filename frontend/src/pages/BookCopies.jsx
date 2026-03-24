import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useUIStore from "../store/useUIStore";
import useModalStore from "../store/useModalStore";
import { bookAPI } from "../api";
import Pagination from "../components/Pagination";
import SearchableSelect from "../components/SearchableSelect";
import useDebounce from "../hooks/useDebounce";

function BookCopies() {
  const {
    books,
    bookCopies,
    bookCopiesMeta,
    fetchBooks,
    fetchBookCopies,
    addBookCopy,
  } = useStore();
  const darkMode = useUIStore((state) => state.darkMode);
  const showAlert = useModalStore((state) => state.showAlert);
  const showConfirm = useModalStore((state) => state.showConfirm);

  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditType, setBulkEditType] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedCopies, setSelectedCopies] = useState([]);
  const [bulkFields, setBulkFields] = useState({
    type: false,
    status: false,
    price: false,
  });
  const [bulkEditForm, setBulkEditForm] = useState({
    type: "",
    status: "",
    price: "",
  });
  const debouncedSearch = useDebounce(search, 300);
  const [copyForm, setCopyForm] = useState({
    book: "",
    type: "borrow",
    price: "",
    quantity: 1,
  });

  useEffect(() => {
    fetchBooks({ page: 1, limit: 1000 });
  }, []);

  useEffect(() => {
    fetchBookCopies({ page, limit, search: debouncedSearch });
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    if (bookCopiesMeta.totalPages > 0 && page > bookCopiesMeta.totalPages) {
      setPage(bookCopiesMeta.totalPages);
    }
  }, [bookCopiesMeta.totalPages, page]);

  const handleCopySubmit = async (e) => {
    e.preventDefault();
    try {
      const quantity = parseInt(copyForm.quantity) || 1;
      const payload = {
        book: copyForm.book,
        type: copyForm.type,
        price: copyForm.price ? parseFloat(copyForm.price) : undefined,
        quantity,
      };
      const result = await addBookCopy(payload);
      const count = Array.isArray(result) ? result.length : 1;
      setCopyForm({ book: "", type: "borrow", price: "", quantity: 1 });
      setShowCopyModal(false);
      setPage(1);
      fetchBookCopies({ page: 1, limit, search: debouncedSearch });
      showAlert(
        "Success",
        `${count} copy${count > 1 ? "ies" : "y"} added successfully!`,
        "success",
      );
    } catch (error) {
      showAlert(
        "Error",
        error.response?.data?.message || "Error adding copy",
        "error",
      );
    }
  };

  const openCopyModal = () => {
    setCopyForm({ book: "", type: "borrow", price: "", quantity: 1 });
    setShowCopyModal(true);
  };

  const toggleSelectAll = () => {
    if (selectedCopies.length === bookCopies.length) {
      setSelectedCopies([]);
    } else {
      setSelectedCopies(bookCopies.map((c) => c._id));
    }
  };

  const toggleSelectCopy = (id) => {
    setSelectedCopies((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const openBulkEditModal = () => {
    if (selectedCopies.length === 0) {
      showAlert(
        "Selection Required",
        "Please select at least one copy",
        "warning",
      );
      return;
    }
    const selectedItems = bookCopies.filter((c) =>
      selectedCopies.includes(c._id),
    );
    const types = [...new Set(selectedItems.map((c) => c.type))];
    if (types.length > 1) {
      showAlert(
        "Mixed Types",
        "Cannot bulk edit: mixed borrow and sell book types selected",
        "warning",
      );
      return;
    }
    setBulkFields({ type: false, status: false, price: false });
    setBulkEditForm({ type: "", status: "", price: "" });
    setBulkEditType(types[0]);
    setShowBulkEditModal(true);
  };

  const handleBulkUpdate = async () => {
    const updates = {};
    if (bulkFields.type && bulkEditForm.type) {
      updates.type = bulkEditForm.type;
    }
    if (bulkFields.status && bulkEditForm.status) {
      updates.status = bulkEditForm.status;
    }
    if (bulkFields.price && bulkEditForm.price) {
      updates.price = parseFloat(bulkEditForm.price);
    }
    if (Object.keys(updates).length === 0) {
      showAlert(
        "No Field Selected",
        "Please select at least one field to update",
        "warning",
      );
      return;
    }
    try {
      await bookAPI.bulkUpdateBookCopies(selectedCopies, updates);
      setSelectedCopies([]);
      setShowBulkEditModal(false);
      fetchBookCopies({ page, limit, search: debouncedSearch });
      showAlert(
        "Success",
        `${selectedCopies.length} copies updated successfully`,
        "success",
      );
    } catch (error) {
      showAlert(
        "Error",
        error.response?.data?.message || "Error updating copies",
        "error",
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCopies.length === 0) {
      showAlert(
        "Selection Required",
        "Please select at least one copy",
        "warning",
      );
      return;
    }
    const confirmed = await showConfirm(
      "Confirm Delete",
      `Delete ${selectedCopies.length} selected copies?`,
    );
    if (!confirmed) return;
    try {
      await bookAPI.bulkDeleteBookCopies(selectedCopies);
      setSelectedCopies([]);
      fetchBookCopies({ page, limit, search: debouncedSearch });
      showAlert(
        "Success",
        `${selectedCopies.length} copies deleted`,
        "success",
      );
    } catch (error) {
      showAlert(
        "Error",
        error.response?.data?.message || "Error deleting copies",
        "error",
      );
    }
  };

  const clearSelection = () => {
    setSelectedCopies([]);
  };

  const containerStyle = darkMode ? "text-white" : "text-gray-900";
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
  const buttonDanger = `px-4 py-2 rounded-md text-sm font-medium border ${
    darkMode
      ? "border-red-600 hover:bg-red-900 text-red-500"
      : "border-red-300 hover:bg-red-50 text-red-600"
  }`;

  const tableBg = darkMode ? "#161b22" : "#ffffff";
  const tableBorder = darkMode ? "#30363d" : "#d0d7de";

  const thClass = "px-4 py-3 text-left font-medium";
  const tdClass = "px-4 py-3";

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: darkMode ? "#fff" : "#111827" }}
        >
          Book Copies
        </h1>
        <div className="flex gap-3">
          {selectedCopies.length > 0 && (
            <>
              <span className="flex items-center text-sm text-gray-500">
                {selectedCopies.length} selected
              </span>
              <button onClick={openBulkEditModal} className={buttonPrimary}>
                Bulk Edit
              </button>
              <button onClick={handleBulkDelete} className={buttonDanger}>
                Delete Selected
              </button>
              <button onClick={clearSelection} className={buttonSecondary}>
                Clear
              </button>
            </>
          )}
          <button onClick={openCopyModal} className={buttonPrimary}>
            Add Copy
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by barcode, book title, type, or status"
          className={inputStyle}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Book Copies Table */}
      <div
        className={`rounded-md border overflow-hidden ${containerStyle}`}
        style={{ backgroundColor: tableBg, borderColor: tableBorder }}
      >
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr
              className={`${
                darkMode
                  ? "bg-[#161b22] text-gray-400"
                  : "bg-gray-50 text-gray-500"
              }`}
            >
              <th className={`${thClass} w-12 first:rounded-tl-md`}>
                <input
                  type="checkbox"
                  checked={
                    selectedCopies.length === bookCopies.length &&
                    bookCopies.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
              <th className={thClass}>Barcode</th>
              <th className={thClass}>Book</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} last:rounded-tr-md`}>Price</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {bookCopies?.map((copy, index) => (
              <tr
                key={copy._id}
                className={`${
                  darkMode ? "border-gray-700" : "border-gray-200"
                } border-b ${selectedCopies.includes(copy._id) ? (darkMode ? "bg-blue-900/30" : "bg-blue-50") : ""}`}
              >
                <td className={`${tdClass} w-12`}>
                  <input
                    type="checkbox"
                    checked={selectedCopies.includes(copy._id)}
                    onChange={() => toggleSelectCopy(copy._id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </td>
                <td className={tdClass}>{copy.barcode}</td>
                <td className={tdClass}>{copy.book?.title || "N/A"}</td>
                <td className={tdClass}>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      copy.type === "borrow"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {copy.type}
                  </span>
                </td>
                <td className={tdClass}>{copy.status}</td>
                <td className={tdClass}>
                  {copy.price ? `MMK ${copy.price}` : "-"}
                </td>
              </tr>
            ))}
            {bookCopies?.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={6}>
                  No copies available yet.
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

      {/* Add Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`border rounded-md w-full max-w-2xl h-[400px] flex flex-col ${containerStyle}`}
            style={{ backgroundColor: tableBg, borderColor: tableBorder }}
          >
            <div className="p-6 pb-0">
              <h2
                className="text-lg font-semibold"
                style={{ color: darkMode ? "#fff" : "#111827" }}
              >
                Add Book Copy
              </h2>
            </div>
            <form
              id="copyForm"
              onSubmit={handleCopySubmit}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
            >
              <SearchableSelect
                value={copyForm.book}
                onChange={(e) =>
                  setCopyForm({ ...copyForm, book: e.target.value })
                }
                options={books || []}
                placeholder="Select Book"
                searchPlaceholder="Search by title, author, ISBN..."
                filterFn={(book, search) =>
                  book.title.toLowerCase().includes(search.toLowerCase()) ||
                  book.author.toLowerCase().includes(search.toLowerCase()) ||
                  book.isbn.toLowerCase().includes(search.toLowerCase())
                }
                renderOption={(book) => (
                  <div>
                    <div className="font-medium">{book.title}</div>
                    <div className="text-xs text-gray-500">
                      {book.author} | {book.category}
                    </div>
                  </div>
                )}
              />
              <select
                className={inputStyle}
                value={copyForm.type}
                onChange={(e) =>
                  setCopyForm({ ...copyForm, type: e.target.value })
                }
              >
                <option value="borrow">Borrow</option>
                <option value="sell">Sell</option>
              </select>
              <div className="flex gap-3">
                {copyForm.type === "sell" && (
                  <input
                    type="number"
                    placeholder="Price"
                    className={inputStyle}
                    value={copyForm.price}
                    onChange={(e) =>
                      setCopyForm({ ...copyForm, price: e.target.value })
                    }
                    required
                  />
                )}
                <input
                  type="number"
                  placeholder="Quantity"
                  className={`${inputStyle} ${copyForm.type === "borrow" ? "flex-1" : "w-24"}`}
                  value={copyForm.quantity}
                  min="1"
                  onChange={(e) =>
                    setCopyForm({
                      ...copyForm,
                      quantity: e.target.value || 1,
                    })
                  }
                  required
                />
              </div>
            </form>
            <div
              className="flex justify-end gap-3 p-6 pt-4 border-t"
              style={{ borderColor: darkMode ? "#30363d" : "#d0d7de" }}
            >
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className={buttonSecondary}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="copyForm"
                className={buttonPrimary}
              >
                Add {copyForm.quantity > 1 ? `${copyForm.quantity} Copies` : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`border rounded-md p-6 w-full max-w-md overflow-hidden ${containerStyle}`}
            style={{ backgroundColor: tableBg, borderColor: tableBorder }}
          >
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: darkMode ? "#fff" : "#111827" }}
            >
              Bulk Edit ({selectedCopies.length} copies)
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Select which fields to update
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Type: <span className="font-medium capitalize">{bulkEditType}</span>
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={bulkFields.type}
                  onChange={(e) =>
                    setBulkFields({ ...bulkFields, type: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer"
                />
                <select
                  className={inputStyle}
                  value={bulkEditForm.type}
                  onChange={(e) =>
                    setBulkEditForm({ ...bulkEditForm, type: e.target.value })
                  }
                  disabled={!bulkFields.type}
                >
                  <option value="">Select Type</option>
                  <option value="borrow">Borrow</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={bulkFields.status}
                  onChange={(e) =>
                    setBulkFields({ ...bulkFields, status: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer"
                />
                <select
                  className={inputStyle}
                  value={bulkEditForm.status}
                  onChange={(e) =>
                    setBulkEditForm({ ...bulkEditForm, status: e.target.value })
                  }
                  disabled={!bulkFields.status}
                >
                  <option value="">Select Status</option>
                  <option value="available">Available</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="sold">Sold</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              {bulkEditType === "sell" && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bulkFields.price}
                    onChange={(e) =>
                      setBulkFields({ ...bulkFields, price: e.target.checked })
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    className={inputStyle}
                    value={bulkEditForm.price}
                    onChange={(e) =>
                      setBulkEditForm({ ...bulkEditForm, price: e.target.value })
                    }
                    disabled={!bulkFields.price}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowBulkEditModal(false)}
                className={buttonSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkUpdate}
                className={buttonPrimary}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookCopies;
