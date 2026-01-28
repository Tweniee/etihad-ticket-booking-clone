"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  parse,
  isValid,
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface DatePickerProps {
  /**
   * The selected date value
   */
  value?: Date | null;

  /**
   * Callback when date is selected
   */
  onChange: (date: Date | null) => void;

  /**
   * Minimum selectable date (dates before this are disabled)
   */
  minDate?: Date;

  /**
   * Maximum selectable date (dates after this are disabled)
   */
  maxDate?: Date;

  /**
   * Placeholder text for the input
   */
  placeholder?: string;

  /**
   * Label for the date picker
   */
  label?: string;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Whether the date picker is disabled
   */
  disabled?: boolean;

  /**
   * Custom class name for the container
   */
  className?: string;

  /**
   * ID for the input element
   */
  id?: string;

  /**
   * Name for the input element
   */
  name?: string;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
}

/**
 * DatePicker component with calendar view
 *
 * Features:
 * - Interactive calendar picker (Requirement 18.1)
 * - Disabled dates (past dates, min/max dates) (Requirement 18.2, 18.3)
 * - Highlighted selected dates (Requirement 18.4)
 * - Clear date format display (Requirement 18.5)
 * - Manual date entry support (Requirement 18.6)
 * - Keyboard navigation
 * - ARIA labels for accessibility
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date",
  label,
  required = false,
  error,
  disabled = false,
  className,
  id,
  name,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [inputValue, setInputValue] = useState(
    value ? format(value, "EEE, MMM d, yyyy") : "",
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when value prop changes
  useEffect(() => {
    if (value) {
      setInputValue(format(value, "EEE, MMM d, yyyy"));
      setCurrentMonth(value);
    } else {
      setInputValue("");
    }
  }, [value]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle manual date input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Try to parse the input value
    // Support multiple formats: MM/DD/YYYY, YYYY-MM-DD, etc.
    const formats = ["MM/dd/yyyy", "yyyy-MM-dd", "MMM d, yyyy", "MMMM d, yyyy"];

    for (const formatStr of formats) {
      try {
        const parsedDate = parse(newValue, formatStr, new Date());
        if (isValid(parsedDate) && !isDateDisabled(parsedDate)) {
          onChange(parsedDate);
          setCurrentMonth(parsedDate);
          return;
        }
      } catch {
        // Continue to next format
      }
    }
  };

  // Handle input blur - validate and format
  const handleInputBlur = () => {
    if (value) {
      setInputValue(format(value, "EEE, MMM d, yyyy"));
    } else if (inputValue.trim() === "") {
      onChange(null);
    }
  };

  // Check if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    if (minDate && isBefore(date, minDate)) {
      return true;
    }
    if (maxDate && isAfter(date, maxDate)) {
      return true;
    }
    return false;
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      onChange(date);
      setInputValue(format(date, "EEE, MMM d, yyyy"));
      setIsOpen(false);
    }
  };

  // Navigate to previous month
  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Toggle calendar visibility
  const toggleCalendar = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCalendar();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel || label || "Date picker"}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "w-full px-4 py-2 pr-10 border rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            error ? "border-red-500" : "border-gray-300",
            "text-gray-900 placeholder-gray-400",
          )}
        />

        <button
          type="button"
          onClick={toggleCalendar}
          disabled={disabled}
          aria-label="Open calendar"
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "p-1 rounded hover:bg-gray-100",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          <Calendar className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {error && (
        <p
          id={`${id}-error`}
          className="mt-1 text-sm text-red-600 flex items-center"
          role="alert"
        >
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}

      {/* Calendar Popup */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200",
            "p-4 w-80",
          )}
          role="dialog"
          aria-label="Calendar"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePreviousMonth}
              aria-label="Previous month"
              className={cn(
                "p-1 rounded hover:bg-gray-100",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
              )}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentMonth, "MMMM yyyy")}
            </h2>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className={cn(
                "p-1 rounded hover:bg-gray-100",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
              )}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = value && isSameDay(day, value);
              const isDisabled = isDateDisabled(day);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  disabled={isDisabled}
                  aria-label={format(day, "EEEE, MMMM d, yyyy")}
                  aria-current={isSelected ? "date" : undefined}
                  className={cn(
                    "aspect-square p-2 text-sm rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "transition-colors",
                    // Current month styling
                    isCurrentMonth ? "text-gray-900" : "text-gray-400",
                    // Selected date styling
                    isSelected &&
                      "bg-blue-600 text-white font-semibold hover:bg-blue-700",
                    // Today styling (if not selected)
                    !isSelected && isToday && "border-2 border-blue-600",
                    // Hover styling (if not selected and not disabled)
                    !isSelected && !isDisabled && "hover:bg-gray-100",
                    // Disabled styling
                    isDisabled &&
                      "opacity-40 cursor-not-allowed hover:bg-transparent",
                    // Default styling
                    !isSelected && !isDisabled && "cursor-pointer",
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {/* Today button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                if (!isDateDisabled(today)) {
                  handleDateSelect(today);
                }
              }}
              disabled={isDateDisabled(new Date())}
              className={cn(
                "w-full py-2 px-4 text-sm font-medium rounded-lg",
                "border border-gray-300 text-gray-700",
                "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
