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
  const pageButtonClass =
    "rounded-lg border px-3 py-1 text-sm font-medium transition hover:bg-[var(--accent-soft)]";

  const getPageItems = () => {
    if (totalPages <= 1) return [1];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    const siblingCount = totalPages <= 15 ? 2 : 1;
    const items = [1];
    const left = Math.max(2, page - siblingCount);
    const right = Math.min(totalPages - 1, page + siblingCount);

    if (left > 2) items.push("ellipsis-left");
    for (let i = left; i <= right; i += 1) items.push(i);
    if (right < totalPages - 1) items.push("ellipsis-right");
    items.push(totalPages);
    return items;
  };

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

        <div className="flex items-center gap-1">
          {getPageItems().map((item) => {
            if (typeof item !== "number") {
              return (
                <span key={item} className="px-2 text-sm" style={{ color: "var(--muted)" }}>
                  ...
                </span>
              );
            }

            const isActive = item === page;
            return (
              <button
                key={item}
                type="button"
                className={pageButtonClass}
                style={{
                  borderColor: "var(--panel-border)",
                  color: "var(--text)",
                  backgroundColor: isActive ? "var(--accent-soft)" : "transparent",
                }}
                onClick={() => onPageChange(item)}
                aria-current={isActive ? "page" : undefined}
              >
                {item}
              </button>
            );
          })}
        </div>

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
