"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Airport } from "@/lib/types";
import { Search, X, Loader2 } from "lucide-react";

export interface AutocompleteInputProps {
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  onSearch: (query: string) => Promise<Airport[]>;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  debounceMs?: number;
  minChars?: number;
  id?: string;
  name?: string;
  required?: boolean;
}

export function AutocompleteInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search airports...",
  label,
  error,
  disabled = false,
  debounceMs = 300,
  minChars = 2,
  id,
  name,
  required = false,
}: AutocompleteInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update input value when value prop changes
  useEffect(() => {
    if (value) {
      setInputValue(formatAirportDisplay(value));
    } else {
      setInputValue("");
    }
  }, [value]);

  // Format airport for display
  const formatAirportDisplay = (airport: Airport): string => {
    return `${airport.city} - ${airport.name} (${airport.code})`;
  };

  // Debounced search function
  const performSearch = useCallback(
    async (query: string) => {
      if (query.length < minChars) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const results = await onSearch(query);
        setSuggestions(results);
        setIsOpen(true);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [onSearch, minChars],
  );

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If input is cleared, reset selection
    if (!query) {
      onChange(null);
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);
  };

  // Handle suggestion selection
  const handleSelect = (airport: Airport) => {
    onChange(airport);
    setInputValue(formatAirportDisplay(airport));
    setIsOpen(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  // Handle clear button
  const handleClear = () => {
    onChange(null);
    setInputValue("");
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;

      case "Tab":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement && highlightedElement.scrollIntoView) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const inputId = id || `autocomplete-${name || "input"}`;
  const hasError = !!error;
  const showClearButton = inputValue && !disabled;

  return (
    <div className="relative w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>

        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={label || placeholder}
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          aria-autocomplete="list"
          aria-controls={isOpen ? `${inputId}-listbox` : undefined}
          aria-expanded={isOpen}
          aria-activedescendant={
            highlightedIndex >= 0
              ? `${inputId}-option-${highlightedIndex}`
              : undefined
          }
          className={`
            block w-full pl-10 pr-10 py-2 
            border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${hasError ? "border-red-500" : "border-gray-300"}
          `}
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading && (
            <Loader2
              className="h-5 w-5 text-gray-400 animate-spin"
              aria-label="Loading"
            />
          )}
          {showClearButton && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              aria-label="Clear input"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id={`${inputId}-listbox`}
          role="listbox"
          aria-label="Airport suggestions"
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        >
          {suggestions.map((airport, index) => (
            <div
              key={airport.code}
              id={`${inputId}-option-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelect(airport)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                cursor-pointer select-none relative py-2 pl-3 pr-9
                ${
                  index === highlightedIndex
                    ? "bg-blue-600 text-white"
                    : "text-gray-900 hover:bg-gray-100"
                }
              `}
            >
              <div className="flex flex-col">
                <span className="font-medium">
                  {airport.city} ({airport.code})
                </span>
                <span
                  className={`text-sm ${
                    index === highlightedIndex
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {airport.name}, {airport.country}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen &&
        !isLoading &&
        suggestions.length === 0 &&
        inputValue.length >= minChars && (
          <div
            className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 px-3 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            role="status"
          >
            <p className="text-gray-500 text-sm">No airports found</p>
          </div>
        )}

      {/* Error message */}
      {hasError && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
