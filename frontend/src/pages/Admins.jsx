import { useEffect, useState } from "react";
import useUIStore from "../store/useUIStore";
import { authAPI, libraryAPI } from "../api";

function Admins() {
  const [admins, setAdmins] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const darkMode = useUIStore((state) => state.darkMode);
  const [formData, setFormData] = useState({ 
    username: "", 
    password: "", 
    name: "", 
    libraryId: "",
    isActive: true 
  });
  const [editingId, setEditingId] = useState(null);

  const fetchAdmins = async (page = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const res = await authAPI.getUsers();
      let adminData = Array.isArray(res.data) ? res.data : res.data.data || [];
      if (searchQuery) {
        adminData = adminData.filter(a => 
          a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setAdmins(adminData);
      setPagination({ page: 1, limit: 10, total: adminData.length, totalPages: 1 });
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
    setLoading(false);
  };

  const fetchLibraries = async () => {
    try {
      const res = await libraryAPI.getLibraries({ limit: 100 });
      setLibraries(res.data.data || res.data);
    } catch (error) {
      console.error("Error fetching libraries:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchLibraries();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAdmins(1, search);
  };

  const openCreateModal = () => {
    setFormData({ username: "", password: "", name: "", libraryId: "", isActive: true });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (admin) => {
    const libraryId =
      typeof admin.library === "object" ? admin.library?._id || "" : admin.library || "";
    setFormData({ 
      username: admin.username, 
      password: "", 
      name: admin.name, 
      libraryId,
      isActive: admin.isActive 
    });
    setEditingId(admin._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ username: "", password: "", name: "", libraryId: "", isActive: true });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        library: formData.libraryId || null,
      };
      delete data.libraryId;
      if (!data.password) delete data.password;
      
      if (editingId) {
        await authAPI.updateUser(editingId, data);
      } else {
        await authAPI.createUser(data);
      }
      closeModal();
      fetchAdmins(pagination.page, search);
    } catch (error) {
      alert(error.response?.data?.message || "Error saving admin");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        await authAPI.deleteUser(id);
        fetchAdmins(pagination.page, search);
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting admin");
      }
    }
  };

  const toggleStatus = async (admin) => {
    try {
      await authAPI.updateUser(admin._id, { isActive: !admin.isActive });
      fetchAdmins(pagination.page, search);
    } catch (error) {
      alert(error.response?.data?.message || "Error updating admin");
    }
  };

  const cardStyle = "panel-solid text-[var(--text)] border-[var(--panel-border)]";
  const inputStyle = "modern-input";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>
          Admins
        </h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 glow-btn rounded-md transition"
        >
          Add Admin
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search admins..."
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
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Username</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Libraries</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8">Loading...</td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">No admins found</td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin._id} className="border-t">
                  <td className="py-3 px-4 font-medium">{admin.username}</td>
                  <td className="py-3 px-4">{admin.name}</td>
                  <td className="py-3 px-4">
                    {admin.library ? (
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          darkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        {typeof admin.library === "object"
                          ? admin.library.name
                          : admin.library}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleStatus(admin)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        admin.isActive
                          ? darkMode ? "bg-green-900/50 text-green-400" : "bg-green-100 text-green-600"
                          : darkMode ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {admin.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditModal(admin)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(admin._id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${cardStyle} p-6 rounded-lg w-full max-w-md`}>
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Admin" : "Add Admin"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${inputStyle}`}
                  disabled={!!editingId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password {editingId ? "(leave blank to keep current)" : "*"}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${inputStyle}`}
                />
              </div>
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
                <label className="block text-sm font-medium mb-2">Library *</label>
                <select
                  required
                  value={formData.libraryId}
                  onChange={(e) => setFormData({ ...formData, libraryId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${inputStyle}`}
                >
                  <option value="">Select a library</option>
                  {libraries.map((lib) => (
                    <option key={lib._id} value={lib._id}>
                      {lib.name}
                    </option>
                  ))}
                </select>
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

export default Admins;
