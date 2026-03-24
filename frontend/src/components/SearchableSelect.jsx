import { useState, useRef, useEffect } from "react";
import useUIStore from "../store/useUIStore";

function SearchableSelect({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select...", 
  searchPlaceholder = "Search...",
  renderOption,
  filterFn,
  className = "" 
}) {
  const darkMode = useUIStore((state) => state.darkMode);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find((opt) => 
    typeof opt === 'object' ? opt._id === value : opt.value === value
  );

  const filteredOptions = filterFn 
    ? options.filter((opt) => filterFn(opt, search))
    : options.filter((opt) => {
        const label = typeof opt === 'object' ? opt.title || opt.name || opt.label : opt;
        return label.toString().toLowerCase().includes(search.toLowerCase());
      });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openDropdown = () => {
    setIsOpen(true);
    setSearch("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (option) => {
    const val = typeof option === 'object' ? option._id : option;
    onChange({ target: { value: val } });
    setIsOpen(false);
    setSearch("");
  };

  const inputStyle = `w-full px-3 py-2 rounded-md border ${
    darkMode
      ? "bg-[#0d1117] border-gray-600 text-white placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  }`;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        onClick={openDropdown}
        className={`w-full px-3 py-2 rounded-md border cursor-pointer flex items-center justify-between ${
          darkMode
            ? "bg-[#0d1117] border-gray-600 text-white"
            : "bg-white border-gray-300 text-gray-900"
        }`}
      >
        <span className={selectedOption ? "" : "text-gray-500"}>
          {selectedOption 
            ? (typeof selectedOption === 'object' 
                ? (selectedOption.title || selectedOption.name || selectedOption.label) 
                : selectedOption)
            : placeholder
          }
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 w-full mt-1 border rounded-md shadow-lg ${
            darkMode ? "bg-[#0d1117] border-gray-600" : "bg-white border-gray-300"
          }`}
        >
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={searchPlaceholder}
              className={inputStyle}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div
            className={`max-h-80 overflow-y-auto ${
              darkMode ? "border-t border-gray-600" : "border-t border-gray-200"
            }`}
          >
            {!search ? (
              <div
                className={`px-3 py-4 text-sm text-center ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Type to search...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div
                className={`px-3 py-2 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No results found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const val = typeof option === 'object' ? option._id : option;
                const label = typeof option === 'object' 
                  ? (option.title || option.name || option.label || option)
                  : option;
                const isSelected = val === value;

                return (
                  <div
                    key={typeof option === 'object' ? option._id : index}
                    onClick={() => handleSelect(option)}
                    className={`px-3 py-2 cursor-pointer text-sm ${
                      isSelected
                        ? darkMode
                          ? "bg-blue-900/30 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                        : darkMode
                        ? "hover:bg-gray-800 text-white"
                        : "hover:bg-gray-100 text-gray-900"
                    } ${renderOption ? "" : "truncate"}`}
                  >
                    {renderOption ? renderOption(option) : label}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
