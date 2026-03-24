import { useEffect, useState } from "react";
import useUIStore from "../store/useUIStore";
import { libraryAPI } from "../api";
import Pagination from "../components/Pagination";

function Libraries() {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const darkMode = useUIStore((state) => state.darkMode);
  const [formData, setFormData] = useState({ name: "", address: "", phone: "", email: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchLibraries = async (page = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const res = await libraryAPI.getLibraries({ page, limit: pagination.limit, search: searchQuery });
      setLibraries(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Error fetching libraries:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLibraries();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLibraries(1, search);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLibraries(newPage, search);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: "", address: "", phone: "", email: "" });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (library) => {
    setFormData({ 
      name: library.name, 
      address: library.address || "", 
      phone: library.phone || "", 
      email: library.email || "" 
    });
    setEditingId(library._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", address: "", phone: "", email: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await libraryAPI.updateLibrary(editingId, formData);
      } else {
        await libraryAPI.createLibrary(formData);
      }
      closeModal();
      fetchLibraries(pagination.page, search);
    } catch (error) {
      alert(error.response?.data?.message || "Error saving library");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this library?")) {
      try {
        await libraryAPI.deleteLibrary(id);
        fetchLibraries(pagination.page, search);
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting library");
      }
    }
  };

  const toggleStatus = async (library) => {
    try {
      await libraryAPI.updateLibrary(library._id, { isActive: !library.isActive });
      fetchLibraries(pagination.page, search);
    } catch (error) {
      alert(error.response?.data?.message || "Error updating library");
    }
  };

  const cardStyle = "panel-solid text-[var(--text)] border-[var(--panel-border)]";
  const inputStyle = "modern-input";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>
          Libraries
        </h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 glow-btn rounded-md transition"
        >
          Add Library
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search libraries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`flex-1 px-3 py-2 border rounded-md ${inputStyle}`}
        />
        <button
          type="submit"
          className="px-4 py-2 glow-btn rounded-md"
        >
          Search
        </button>
      </form>

      <div className={`border rounded-md overflow-hidden ${cardStyle}`}>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Address</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Phone</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8">Loading...</td>
              </tr>
            ) : libraries.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">No libraries found</td>
              </tr>
            ) : (
              libraries.map((library) => (
                <tr key={library._id} className="border-t">
                  <td className="py-3 px-4 font-medium">{library.name}</td>
                  <td className="py-3 px-4 text-gray-500">{library.address || "-"}</td>
                  <td className="py-3 px-4 text-gray-500">{library.phone || "-"}</td>
                  <td className="py-3 px-4 text-gray-500">{library.email || "-"}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleStatus(library)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        library.isActive
                          ? darkMode ? "bg-green-900/50 text-green-400" : "bg-green-100 text-green-600"
                          : darkMode ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {library.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditModal(library)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(library._id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={handlePageChange}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${cardStyle} p-6 rounded-lg w-full max-w-md`}>
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Library" : "Add Library"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${inputStyle}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${inputStyle}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${inputStyle}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${inputStyle}`}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 glow-btn rounded-md"
                >
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Libraries;
