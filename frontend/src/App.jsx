import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
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

function AdminOnlyRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" />;
  return user.role === "admin" ? children : <Navigate to="/" />;
}

function DashboardRouter() {
  const user = useAuthStore((state) => state.user);
  if (user?.role === "superadmin") {
    return <SuperAdminDashboard />;
  }
  return <Dashboard />;
}

function Layout({ children }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const density = useUIStore((state) => state.density);

  return (
    <div className={`app-shell density-${density}`}>
      <Navbar onLogout={logout} user={user} />
      <div className="flex pt-20">
        <Sidebar />
        <main
          className={`modern-content flex-1 px-4 pb-8 pt-4 transition-all duration-200 md:px-6 ${
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
  const initDarkMode = useUIStore((state) => state.initDarkMode);

  useEffect(() => {
    initDarkMode();
  }, [initDarkMode]);

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
                  <Route
                    path="/books"
                    element={
                      <AdminOnlyRoute>
                        <Books />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="/copies"
                    element={
                      <AdminOnlyRoute>
                        <BookCopies />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="/members"
                    element={
                      <AdminOnlyRoute>
                        <Members />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="/issue"
                    element={
                      <AdminOnlyRoute>
                        <Issue />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="/return"
                    element={
                      <AdminOnlyRoute>
                        <Return />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="/borrow/report"
                    element={
                      <AdminOnlyRoute>
                        <BorrowReport />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="/sales"
                    element={
                      <AdminOnlyRoute>
                        <Sales />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="/sales/report"
                    element={
                      <AdminOnlyRoute>
                        <SalesReport />
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="/payments"
                    element={
                      <AdminOnlyRoute>
                        <Payments />
                      </AdminOnlyRoute>
                    }
                  />
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
