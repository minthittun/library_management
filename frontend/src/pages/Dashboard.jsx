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

function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCopies: 0,
    borrowedBooks: 0,
    soldBooks: 0,
    availableBorrowBooks: 0,
    availableSellBooks: 0,
    activeMembers: 0,
    currentMonthName: "",
    daysInMonth: 30,
    dailySales: [],
    dailyBorrows: [],
    overdueBorrows: [],
    recentSales: [],
  });
  const darkMode = useUIStore((state) => state.darkMode);

  useEffect(() => {
    dashboardAPI.getStats().then((res) => setStats(res.data));
  }, []);

  const cardStyle = "panel-solid text-[var(--text)]";

  const chartColors = {
    primary: darkMode ? "#60a5fa" : "#3b82f6",
    secondary: darkMode ? "#34d399" : "#10b981",
    grid: darkMode ? "#374151" : "#e5e7eb",
    text: darkMode ? "#9ca3af" : "#6b7280",
    background: darkMode ? "#0d1117" : "#ffffff",
  };

  const cards = [
    { title: "Total Books", value: stats.totalBooks, color: "blue" },
    { title: "Total Copies", value: stats.totalCopies, color: "indigo" },
    { title: "Borrowed Books", value: stats.borrowedBooks, color: "yellow" },
    { title: "Sold Books", value: stats.soldBooks, color: "purple" },
    { title: "Available Borrow", value: stats.availableBorrowBooks, color: "green" },
    { title: "Available Sell", value: stats.availableSellBooks, color: "teal" },
    { title: "Active Members", value: stats.activeMembers, color: "pink" },
    { title: "Expired Members", value: stats.expiredMembers, color: "red" },
  ];

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>
        Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.title} className={`border rounded-md p-4 ${cardStyle}`}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {card.title}
            </p>
            <p className="text-2xl font-semibold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`border rounded-md p-4 ${cardStyle}`}>
          <h2 className="text-lg font-semibold mb-2">Daily Sales - {stats.currentMonthName}</h2>
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
          <h2 className="text-lg font-semibold mb-2">Daily Borrows - {stats.currentMonthName}</h2>
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

export default Dashboard;
