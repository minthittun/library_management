function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}) {
  const buttonClass =
    "rounded-lg border px-3 py-1 text-sm font-medium transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 panel-solid">
      <div className="text-sm" style={{ color: "var(--muted)" }}>
        Total: {total} | Page {totalPages === 0 ? 0 : page} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        {onLimitChange && (
          <select
            className="modern-input rounded-lg px-2 py-1 text-sm"
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
          style={{ borderColor: "var(--panel-border)", color: "var(--text)" }}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Prev
        </button>

        <button
          type="button"
          className={buttonClass}
          style={{ borderColor: "var(--panel-border)", color: "var(--text)" }}
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
