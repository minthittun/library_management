import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import useUIStore from "../store/useUIStore";

function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    borrowedBooks: 0,
    soldBooks: 0,
    activeMembers: 0,
  });
  const getStats = useStore((state) => state.getStats);
  const darkMode = useUIStore((state) => state.darkMode);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  const cards = [
    { title: "Total Books", value: stats.totalBooks },
    { title: "Borrowed Books", value: stats.borrowedBooks },
    { title: "Sold Books", value: stats.soldBooks },
    { title: "Active Members", value: stats.activeMembers },
  ];

  const cardStyle = darkMode
    ? "bg-[#161b22] border-[#30363d] text-white"
    : "bg-white border-[#d0d7de] text-gray-900";

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6" style={{ color: darkMode ? '#ffffff' : '#111827' }}>Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
}

export default Dashboard;
