import { useEffect, useMemo, useState } from "react";
import useStore from "../store/useStore";
import useAuthStore from "../store/useAuthStore";
import useUIStore from "../store/useUIStore";
import useModalStore from "../store/useModalStore";
import useDebounce from "../hooks/useDebounce";

function Sales() {
  const { fetchBookCopies, checkoutSale } = useStore();
  const user = useAuthStore((state) => state.user);
  const darkMode = useUIStore((state) => state.darkMode);
  const showAlert = useModalStore((state) => state.showAlert);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [discountPct, setDiscountPct] = useState("0");
  const [taxPct, setTaxPct] = useState("0");
  const [payAmount, setPayAmount] = useState("");

  const containerStyle = darkMode ? "text-white" : "text-gray-900";
  const tableBg = darkMode ? "#161b22" : "#ffffff";
  const tableBorder = darkMode ? "#30363d" : "#d0d7de";
  const thClass = "px-4 py-3 text-left font-medium";
  const tdClass = "px-4 py-3";
  const inputStyle = `w-full px-3 py-2 rounded-md border ${
    darkMode
      ? "bg-[#0d1117] border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900"
  }`;
  const buttonPrimary = `px-4 py-2 rounded-md text-sm font-medium ${
    darkMode
      ? "bg-blue-600 hover:bg-blue-500 text-white"
      : "bg-blue-600 hover:bg-blue-500 text-white"
  }`;
  const buttonSecondary = `px-4 py-2 rounded-md text-sm font-medium border ${
    darkMode
      ? "border-gray-600 hover:bg-gray-800 text-gray-300"
      : "border-gray-300 hover:bg-gray-100 text-gray-700"
  }`;
  const buttonDanger = `px-4 py-2 rounded-md text-sm font-medium ${
    darkMode
      ? "bg-red-600 hover:bg-red-500 text-white"
      : "bg-red-600 hover:bg-red-500 text-white"
  }`;
  const buttonSuccess = `px-4 py-2 rounded-md text-sm font-medium ${
    darkMode
      ? "bg-green-600 hover:bg-green-500 text-white"
      : "bg-green-600 hover:bg-green-500 text-white"
  }`;

  useEffect(() => {
    const load = async () => {
      if (!debouncedSearch) {
        setResults([]);
        return;
      }
      try {
        const data = await fetchBookCopies({
          page: 1,
          limit: 50,
          search: debouncedSearch,
          type: "sell",
          status: "available",
        });
        setResults(data || []);
      } catch {
        setResults([]);
      }
    };
    load();
  }, [debouncedSearch]);

  const addToCart = (copy) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.copyId === copy._id);
      if (existing) {
        return prev;
      }
      return [
        ...prev,
        {
          copyId: copy._id,
          bookId: copy.book?._id,
          title: copy.book?.title,
          barcode: copy.barcode,
          unitPrice: copy.price || 0,
        },
      ];
    });
    setSearch("");
    setResults([]);
  };

  const removeItem = (copyId) => {
    setCart((prev) => prev.filter((item) => item.copyId !== copyId));
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice, 0),
    [cart],
  );
  const discountAmount = (subtotal * (Number(discountPct) || 0)) / 100;
  const taxable = subtotal - discountAmount;
  const taxAmount = (taxable * (Number(taxPct) || 0)) / 100;
  const total = taxable + taxAmount;
  const change = Math.max(0, (Number(payAmount) || 0) - total);

  const handleCheckout = async () => {
    if (!cart.length) {
      showAlert("Cart Empty", "Please add items to cart.", "warning");
      return;
    }
    if (!payAmount || Number(payAmount) < total) {
      showAlert("Invalid Payment", "Pay amount must be greater than or equal to total.", "warning");
      return;
    }
    try {
      await checkoutSale({
        items: cart.map((item) => ({
          bookId: item.bookId,
          copyId: item.copyId,
          quantity: 1,
        })),
        soldBy: user?.name || "Unknown",
        discountPct: Number(discountPct) || 0,
        taxPct: Number(taxPct) || 0,
        payAmount: Number(payAmount),
      });
      setCart([]);
      setSearch("");
      setResults([]);
      setDiscountPct("0");
      setTaxPct("0");
      setPayAmount("");
      showAlert("Success", "Sale completed successfully!", "success");
    } catch (error) {
      showAlert("Error", error.response?.data?.message || "Error processing sale", "error");
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const exact = results.find((r) => r.barcode === search.trim());
      if (exact) {
        addToCart(exact);
        setSearch("");
        setResults([]);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: darkMode ? "#ffffff" : "#111827" }}
        >
          Sales POS
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Scan barcode or search title"
              className={inputStyle}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <div
            className={`rounded-md border overflow-hidden ${containerStyle}`}
            style={{ backgroundColor: tableBg, borderColor: tableBorder }}
          >
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr
                  className={
                    darkMode
                      ? "bg-[#161b22] text-gray-400"
                      : "bg-gray-50 text-gray-500"
                  }
                >
                  <th className={`${thClass} first:rounded-tl-md`}>Barcode</th>
                  <th className={thClass}>Book</th>
                  <th className={thClass}>Price</th>
                  <th className={`${thClass} last:rounded-tr-md`}>Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {results.map((copy, index) => (
                  <tr
                    key={copy._id}
                    className={`${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    } border-b`}
                  >
                    <td
                      className={`${tdClass} ${
                        index === results.length - 1 ? "rounded-bl-md" : ""
                      }`}
                    >
                      {copy.barcode}
                    </td>
                    <td className={tdClass}>{copy.book?.title || "N/A"}</td>
                    <td className={tdClass}>MMK {copy.price || 0}</td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        className={buttonSuccess}
                        onClick={() => addToCart(copy)}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td className={tdClass} colSpan={4}>
                      Scan barcode or search to add items.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div
            className={`rounded-md border overflow-hidden ${containerStyle}`}
            style={{ backgroundColor: tableBg, borderColor: tableBorder }}
          >
            <div className="p-4 border-b" style={{ borderColor: tableBorder }}>
              <div className="text-lg font-semibold">Cart ({cart.length})</div>
            </div>
            <div className="p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.copyId} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.barcode}</div>
                    <div className="text-xs text-gray-500">
                      MMK {item.unitPrice}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={buttonDanger}
                    onClick={() => removeItem(item.copyId)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-sm text-gray-500">
                  No items in cart.
                </div>
              )}
            </div>
            <div className="p-4 border-t" style={{ borderColor: tableBorder }}>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Discount %</label>
                  <input
                    type="number"
                    className={inputStyle}
                    value={discountPct}
                    onChange={(e) => setDiscountPct(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tax %</label>
                  <input
                    type="number"
                    className={inputStyle}
                    value={taxPct}
                    onChange={(e) => setTaxPct(e.target.value)}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500 space-y-1 mb-3">
                <div>Subtotal: MMK {subtotal.toFixed(2)}</div>
                <div>Discount: MMK {discountAmount.toFixed(2)}</div>
                <div>Tax: MMK {taxAmount.toFixed(2)}</div>
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  Total: MMK {total.toFixed(2)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Pay Amount</label>
                  <input
                    type="number"
                    className={inputStyle}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Change</label>
                  <div className={`px-3 py-2 rounded-md border ${
                    darkMode
                      ? "bg-[#0d1117] border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}>
                    MMK {change.toFixed(2)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={buttonPrimary}
                onClick={handleCheckout}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sales;
