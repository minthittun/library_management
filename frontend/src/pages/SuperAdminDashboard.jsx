import { useEffect, useState } from "react";
import useUIStore from "../store/useUIStore";
import { dashboardAPI } from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    summary: {
      totalLibraries: 0,
      activeLibraries: 0,
      totalAdmins: 0,
      activeAdmins: 0,
      totalBooks: 0,
      totalCopies: 0,
      availableCopies: 0,
      borrowedCopies: 0,
      soldCopies: 0,
      activeMembers: 0,
      expiredMembers: 0,
      monthlyRevenue: 0,
      monthlySales: 0,
      monthlyBorrows: 0,
      currentMonthName: "",
    },
    libraryStats: [],
    dailySales: [],
    dailyBorrows: [],
    overdueBorrows: [],
    recentSales: [],
    daysInMonth: 30,
  });
  const darkMode = useUIStore((state) => state.darkMode);

  useEffect(() => {
    dashboardAPI.getSuperAdminStats().then((res) => setStats(res.data));
  }, []);

  const cardStyle = darkMode
    ? "bg-[#161b22] border-[#30363d] text-white"
    : "bg-white border-[#d0d7de] text-gray-900";

  const chartColors = {
    primary: darkMode ? "#60a5fa" : "#3b82f6",
    secondary: darkMode ? "#34d399" : "#10b981",
    grid: darkMode ? "#374151" : "#e5e7eb",
    text: darkMode ? "#9ca3af" : "#6b7280",
    background: darkMode ? "#0d1117" : "#ffffff",
  };

  const { summary } = stats;

  const cards = [
    { title: "Total Libraries", value: summary.totalLibraries, color: "blue" },
    { title: "Active Libraries", value: summary.activeLibraries, color: "green" },
    { title: "Total Admins", value: summary.totalAdmins, color: "indigo" },
    { title: "Active Admins", value: summary.activeAdmins, color: "teal" },
    { title: "Total Books", value: summary.totalBooks, color: "purple" },
    { title: "Total Copies", value: summary.totalCopies, color: "pink" },
    { title: "Available Copies", value: summary.availableCopies, color: "green" },
    { title: "Borrowed Copies", value: summary.borrowedCopies, color: "yellow" },
    { title: "Sold Copies", value: summary.soldCopies, color: "orange" },
    { title: "Active Members", value: summary.activeMembers, color: "blue" },
    { title: "Monthly Revenue", value: `MMK ${summary.monthlyRevenue?.toFixed(2) || 0}`, color: "green" },
    { title: "Monthly Sales", value: summary.monthlySales, color: "indigo" },
  ];

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold" style={{ color: darkMode ? '#ffffff' : '#111827' }}>
        Super Admin Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`border rounded-md p-4 ${cardStyle}`}
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {card.title}
            </p>
            <p className="text-2xl font-semibold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`border rounded-md p-4 ${cardStyle}`}>
          <h2 className="text-lg font-semibold mb-2">Daily Sales - {summary.currentMonthName}</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: chartColors.text, fontSize: 11 }} 
                  interval={Math.floor(stats.daysInMonth / 15)}
                />
                <YAxis tick={{ fill: chartColors.text, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.background,
                    border: `1px solid ${chartColors.grid}`,
                    borderRadius: "0.375rem",
                  }}
                  labelStyle={{ color: darkMode ? "#fff" : "#111" }}
                  formatter={(value, name) => [value, name === 'count' ? 'Sales' : 'Revenue']}
                />
                <Bar dataKey="count" fill={chartColors.primary} name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`border rounded-md p-4 ${cardStyle}`}>
          <h2 className="text-lg font-semibold mb-2">Daily Borrows - {summary.currentMonthName}</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyBorrows}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: chartColors.text, fontSize: 11 }}
                  interval={Math.floor(stats.daysInMonth / 15)}
                />
                <YAxis tick={{ fill: chartColors.text, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.background,
                    border: `1px solid ${chartColors.grid}`,
                    borderRadius: "0.375rem",
                  }}
                  labelStyle={{ color: darkMode ? "#fff" : "#111" }}
                />
                <Line type="monotone" dataKey="count" stroke={chartColors.secondary} name="Borrows" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={`border rounded-md p-4 ${cardStyle}`}>
        <h2 className="text-lg font-semibold mb-4">Library Statistics</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className="text-left py-2 px-2 text-gray-500">Library</th>
                <th className="text-left py-2 px-2 text-gray-500">Status</th>
                <th className="text-right py-2 px-2 text-gray-500">Books</th>
                <th className="text-right py-2 px-2 text-gray-500">Members</th>
                <th className="text-right py-2 px-2 text-gray-500">Sales</th>
                <th className="text-right py-2 px-2 text-gray-500">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.libraryStats && stats.libraryStats.length > 0 ? (
                stats.libraryStats.map((lib) => (
                  <tr key={lib.libraryId} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="py-2 px-2 font-medium">{lib.library}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        lib.isActive 
                          ? darkMode ? "bg-green-900/50 text-green-400" : "bg-green-100 text-green-600"
                          : darkMode ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-600"
                      }`}>
                        {lib.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">{lib.bookCount}</td>
                    <td className="py-2 px-2 text-right">{lib.memberCount}</td>
                    <td className="py-2 px-2 text-right">{lib.salesCount}</td>
                    <td className="py-2 px-2 text-right">MMK {lib.totalRevenue?.toFixed(2) || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-500">No library data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`border rounded-md p-4 ${cardStyle}`}>
          <h2 className="text-lg font-semibold mb-4">Overdue Returns</h2>
          {stats.overdueBorrows && stats.overdueBorrows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left py-2 px-2 text-gray-500">Book</th>
                    <th className="text-left py-2 px-2 text-gray-500">Member</th>
                    <th className="text-left py-2 px-2 text-gray-500">Due Date</th>
                    <th className="text-left py-2 px-2 text-gray-500">Days Over</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.overdueBorrows.map((record) => {
                    const dueDate = new Date(record.dueDate);
                    const daysOver = Math.ceil((new Date() - dueDate) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={record._id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="py-2 px-2">{record.bookCopy?.book?.title || "N/A"}</td>
                        <td className="py-2 px-2">{record.member?.name || "N/A"}</td>
                        <td className="py-2 px-2">{formatDate(record.dueDate)}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            darkMode ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-600"
                          }`}>
                            {daysOver} days
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No overdue returns</p>
          )}
        </div>

        <div className={`border rounded-md p-4 ${cardStyle}`}>
          <h2 className="text-lg font-semibold mb-4">Recent Sales</h2>
          {stats.recentSales && stats.recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left py-2 px-2 text-gray-500">Book</th>
                    <th className="text-left py-2 px-2 text-gray-500">Price</th>
                    <th className="text-left py-2 px-2 text-gray-500">Date</th>
                    <th className="text-left py-2 px-2 text-gray-500">Sold By</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSales.map((sale) => (
                    <tr key={sale._id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-2 px-2">{sale.bookCopy?.book?.title || "N/A"}</td>
                      <td className="py-2 px-2">MMK {sale.price?.toFixed(2)}</td>
                      <td className="py-2 px-2">{formatDate(sale.soldDate)}</td>
                      <td className="py-2 px-2">{sale.soldBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No recent sales</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
