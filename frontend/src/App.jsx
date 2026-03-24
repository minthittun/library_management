import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ModalProvider from "./components/ModalProvider";
import Dashboard from "./pages/Dashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Books from "./pages/Books";
import BookCopies from "./pages/BookCopies";
import Members from "./pages/Members";
import Issue from "./pages/Issue";
import Return from "./pages/Return";
import BorrowReport from "./pages/BorrowReport";
import Sales from "./pages/Sales";
import SalesReport from "./pages/SalesReport";
import Payments from "./pages/Payments";
import Libraries from "./pages/Libraries";
import Admins from "./pages/Admins";
import Login from "./pages/Login";
import useAuthStore from "./store/useAuthStore";
import useUIStore from "./store/useUIStore";

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function DashboardRouter() {
  const user = useAuthStore((state) => state.user);
  if (user?.role === 'superadmin') {
    return <SuperAdminDashboard />;
  }
  return <Dashboard />;
}

function Layout({ children }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const darkMode = useUIStore((state) => state.darkMode);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#010409]" : "bg-[#ffffff]"}`}>
      <Navbar onLogout={logout} user={user} />
      <div className="flex pt-12">
        <Sidebar />
        <main
          className={`flex-1 p-6 transition-all duration-200 ${
            sidebarCollapsed ? "ml-16" : "ml-72"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ModalProvider />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<DashboardRouter />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/copies" element={<BookCopies />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/issue" element={<Issue />} />
                  <Route path="/return" element={<Return />} />
                  <Route path="/borrow/report" element={<BorrowReport />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/sales/report" element={<SalesReport />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/admin/libraries" element={<Libraries />} />
                  <Route path="/admin/admins" element={<Admins />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
