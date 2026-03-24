import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useUIStore from "../store/useUIStore";
import Pagination from "../components/Pagination";
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

  const [showCopyModal, setShowCopyModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(search, 300);
  const [copyForm, setCopyForm] = useState({
    book: "",
    type: "borrow",
    price: "",
    barcode: "",
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
      await addBookCopy({
        ...copyForm,
        price: copyForm.type === "sell" ? parseFloat(copyForm.price) : undefined,
      });
      setCopyForm({ book: "", type: "borrow", price: "", barcode: "" });
      setShowCopyModal(false);
      setPage(1);
      fetchBookCopies({ page: 1, limit, search: debouncedSearch });
    } catch (error) {
      alert(error.response?.data?.message || "Error adding copy");
    }
  };

  const generateBarcode = (category, existingBarcodes) => {
    const catPrefix = category ? category.substring(0, 3).toUpperCase() : "BK";
    let barcode;
    let attempts = 0;
    do {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      barcode = `${catPrefix}-${timestamp}-${random}`;
      attempts++;
    } while (existingBarcodes?.includes(barcode) && attempts < 5);
    return barcode;
  };

  const handleBookSelect = (e) => {
    const selectedBook = books.find((b) => b._id === e.target.value);
    const category = selectedBook?.category || "";
    const existingBarcodes = bookCopies?.map((c) => c.barcode) || [];
    setCopyForm({
      ...copyForm,
      book: e.target.value,
      barcode: generateBarcode(category, existingBarcodes),
    });
  };

  const openCopyModal = () => {
    setCopyForm({ book: "", type: "borrow", price: "", barcode: "" });
    setShowCopyModal(true);
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
      : "bg-green-600 hover:bg-green-500 text-white"
  }`;
  const buttonSecondary = `px-4 py-2 rounded-md text-sm font-medium border ${
    darkMode
      ? "border-gray-600 hover:bg-gray-800 text-gray-300"
      : "border-gray-300 hover:bg-gray-100 text-gray-700"
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
                darkMode ? "bg-[#161b22] text-gray-400" : "bg-gray-50 text-gray-500"
              }`}
            >
              <th className={`${thClass} first:rounded-tl-md last:rounded-tr-md`}>
                Barcode
              </th>
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
                <td
                  className={`${tdClass} ${
                    index === bookCopies.length - 1 ? "rounded-br-md" : ""
                  }`}
                >
                  {copy.price ? `MMK ${copy.price}` : "-"}
                </td>
              </tr>
            ))}
            {bookCopies?.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={5}>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`border rounded-md p-6 w-full max-w-lg overflow-hidden ${containerStyle}`}
            style={{ backgroundColor: tableBg, borderColor: tableBorder }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: darkMode ? "#fff" : "#111827" }}
            >
              Add Book Copy
            </h2>
            <form onSubmit={handleCopySubmit} className="space-y-3">
              <select
                className={inputStyle}
                value={copyForm.book}
                onChange={handleBookSelect}
                required
              >
                <option value="">Select Book</option>
                {books?.map((book) => (
                  <option key={book._id} value={book._id}>
                    {book.title}
                  </option>
                ))}
              </select>
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
              <input
                type="text"
                placeholder="Barcode"
                className={inputStyle}
                value={copyForm.barcode}
                onChange={(e) =>
                  setCopyForm({ ...copyForm, barcode: e.target.value })
                }
                required
              />
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
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCopyModal(false)}
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
    </div>
  );
}

export default BookCopies;
