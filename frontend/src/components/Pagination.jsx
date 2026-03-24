function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  darkMode,
}) {
  const buttonClass = `px-3 py-1 rounded-md text-sm border ${
    darkMode
      ? "border-gray-600 text-gray-200 hover:bg-gray-800"
      : "border-gray-300 text-gray-700 hover:bg-gray-100"
  }`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
      <div className="text-sm text-gray-500">
        Total: {total} | Page {totalPages === 0 ? 0 : page} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        {onLimitChange && (
          <select
            className={`px-2 py-1 rounded-md border text-sm ${
              darkMode
                ? "bg-[#0d1117] border-gray-600 text-gray-200"
                : "bg-white border-gray-300 text-gray-700"
            }`}
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          className={buttonClass}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Prev
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
