import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import BookCopies from "./pages/BookCopies";
import Members from "./pages/Members";
import Issue from "./pages/Issue";
import Return from "./pages/Return";
import Sales from "./pages/Sales";
import SalesReport from "./pages/SalesReport";
import Payments from "./pages/Payments";
import Login from "./pages/Login";
import useAuthStore from "./store/useAuthStore";
import useUIStore from "./store/useUIStore";

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const darkMode = useUIStore((state) => state.darkMode);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div
                className={`min-h-screen ${darkMode ? "bg-[#010409]" : "bg-[#ffffff]"}`}
              >
                <Navbar onLogout={logout} user={user} />
                <div className="flex pt-12">
                  <Sidebar />
                  <main
                    className={`flex-1 p-6 transition-all duration-200 ${
                      sidebarCollapsed ? "ml-16" : "ml-72"
                    }`}
                  >
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/books" element={<Books />} />
                      <Route path="/copies" element={<BookCopies />} />
                      <Route path="/members" element={<Members />} />
                      <Route path="/issue" element={<Issue />} />
                      <Route path="/return" element={<Return />} />
                      <Route path="/sales" element={<Sales />} />
                      <Route path="/sales/report" element={<SalesReport />} />
                      <Route path="/payments" element={<Payments />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
