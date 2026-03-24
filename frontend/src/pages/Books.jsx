import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useUIStore from "../store/useUIStore";
import useModalStore from "../store/useModalStore";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";

function Books() {
  const { books, booksMeta, fetchBooks, addBook } = useStore();

  const darkMode = useUIStore((state) => state.darkMode);
  const showAlert = useModalStore((state) => state.showAlert);

  const [showBookModal, setShowBookModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(search, 500);

  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    publisher: "",
    publishedYear: "",
  });

  useEffect(() => {
    fetchBooks({ page, limit, search: debouncedSearch });
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    if (booksMeta.totalPages > 0 && page > booksMeta.totalPages) {
      setPage(booksMeta.totalPages);
    }
  }, [booksMeta.totalPages, page]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      await addBook({
        ...bookForm,
        publishedYear: parseInt(bookForm.publishedYear),
      });
      setBookForm({
        title: "",
        author: "",
        isbn: "",
        category: "",
        publisher: "",
        publishedYear: "",
      });
      setShowBookModal(false);
      setPage(1);
      fetchBooks({ page: 1, limit, search: debouncedSearch });
      showAlert("Success", "Book added successfully!", "success");
    } catch (error) {
      showAlert(
        "Error",
        error.response?.data?.message || "Error adding book",
        "error",
      );
    }
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
          Books
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBookModal(true)}
            className={buttonPrimary}
          >
            Add Book
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title, author, ISBN, category, publisher, or year"
          className={inputStyle}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Books Table */}
      <div
        className={`rounded-md border overflow-hidden ${containerStyle} mb-8`}
        style={{ backgroundColor: tableBg, borderColor: tableBorder }}
      >
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr
              className={`${darkMode ? "bg-[#161b22] text-gray-400" : "bg-gray-50 text-gray-500"}`}
            >
              <th
                className={`${thClass} first:rounded-tl-md last:rounded-tr-md`}
              >
                Title
              </th>
              <th className={thClass}>Author</th>
              <th className={thClass}>ISBN</th>
              <th className={thClass}>Category</th>
              <th className={thClass}>Publisher</th>
              <th className={`${thClass} last:rounded-tr-md`}>Year</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {books.map((book, index) => (
              <tr
                key={book._id}
                className={`${darkMode ? "border-gray-700" : "border-gray-200"} border-b`}
              >
                <td
                  className={`${tdClass} ${index === books.length - 1 ? "rounded-bl-md" : ""}`}
                >
                  {book.title}
                </td>
                <td className={tdClass}>{book.author}</td>
                <td className={tdClass}>{book.isbn}</td>
                <td className={tdClass}>{book.category}</td>
                <td className={tdClass}>{book.publisher}</td>
                <td
                  className={`${tdClass} ${index === books.length - 1 ? "rounded-br-md" : ""}`}
                >
                  {book.publishedYear}
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={6}>
                  No books match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={booksMeta.totalPages}
        total={booksMeta.total}
        limit={booksMeta.limit}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
        darkMode={darkMode}
      />

      {/* Add Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`border rounded-md p-6 w-full max-w-lg overflow-hidden ${containerStyle}`}
            style={{ backgroundColor: tableBg, borderColor: tableBorder }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: darkMode ? "#fff" : "#111827" }}
            >
              Add New Book
            </h2>
            <form onSubmit={handleBookSubmit} className="space-y-3">
              {["title", "author", "isbn", "publisher"].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className={inputStyle}
                  value={bookForm[field]}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, [field]: e.target.value })
                  }
                  required
                />
              ))}
              <select
                className={inputStyle}
                value={bookForm.category}
                onChange={(e) =>
                  setBookForm({ ...bookForm, category: e.target.value })
                }
                required
              >
                <option value="">Select Category</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="History">History</option>
                <option value="Biography">Biography</option>
                <option value="Romance">Romance</option>
                <option value="Mystery">Mystery</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Business">Business</option>
                <option value="Self-Help">Self-Help</option>
                <option value="Children">Children</option>
                <option value="Reference">Reference</option>
                <option value="Textbook">Textbook</option>
              </select>
              <input
                type="number"
                placeholder="Published Year"
                className={inputStyle}
                value={bookForm.publishedYear}
                onChange={(e) =>
                  setBookForm({ ...bookForm, publishedYear: e.target.value })
                }
                required
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
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

export default Books;
