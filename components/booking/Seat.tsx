/**
 * Seat Component
 *
 * Displays an individual seat in the seat map with visual indicators
 * for availability, type, and selection status.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.5
 */

"use client";

import React from "react";
import type { Seat as SeatType } from "@/lib/types";

interface SeatProps {
  seat: SeatType;
  isSelected: boolean;
  onSelect: (seat: SeatType) => void;
  disabled?: boolean;
}

/**
 * Get seat color based on status and type
 */
function getSeatColor(seat: SeatType, isSelected: boolean): string {
  if (isSelected) {
    return "bg-blue-600 text-white border-blue-700";
  }

  switch (seat.status) {
    case "available":
      if (seat.price > 0) {
        return "bg-green-100 text-green-900 border-green-300 hover:bg-green-200";
      }
      return "bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200";
    case "occupied":
      return "bg-gray-400 text-gray-600 border-gray-500 cursor-not-allowed";
    case "blocked":
      return "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed";
    default:
      return "bg-gray-100 text-gray-900 border-gray-300";
  }
}

/**
 * Get seat icon based on position
 */
function getSeatIcon(position: SeatType["position"]): string {
  switch (position) {
    case "window":
      return "🪟";
    case "aisle":
      return "🚶";
    case "middle":
      return "·";
    default:
      return "";
  }
}

/**
 * Get seat type label
 */
function getSeatTypeLabel(type: SeatType["type"]): string {
  switch (type) {
    case "extra-legroom":
      return "Extra Legroom";
    case "exit-row":
      return "Exit Row";
    case "preferred":
      return "Preferred";
    case "standard":
    default:
      return "Standard";
  }
}

export function Seat({
  seat,
  isSelected,
  onSelect,
  disabled = false,
}: SeatProps) {
  const isAvailable = seat.status === "available";
  const isClickable = isAvailable && !disabled;

  const handleClick = () => {
    if (isClickable) {
      onSelect(seat);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onSelect(seat);
    }
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={!isClickable}
        className={`
          w-8 h-8 sm:w-10 sm:h-10 rounded-md border-2 text-xs font-semibold
          transition-all duration-200
          flex items-center justify-center
          touch-manipulation
          ${getSeatColor(seat, isSelected)}
          ${isClickable ? "cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none active:scale-95" : ""}
        `}
        aria-label={`Seat ${seat.row}${seat.column}, ${getSeatTypeLabel(seat.type)}, ${seat.status}${seat.price > 0 ? `, $${seat.price} extra` : ""}`}
        aria-pressed={isSelected}
        data-testid={`seat-${seat.row}${seat.column}`}
      >
        <span className="text-[9px] sm:text-[10px]">{seat.column}</span>
      </button>

      {/* Tooltip on hover (desktop only) */}
      {isAvailable && (
        <div className="hidden sm:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg">
          <div className="font-semibold mb-1">
            Seat {seat.row}
            {seat.column}
          </div>
          <div className="space-y-0.5">
            <div>
              {getSeatIcon(seat.position)}{" "}
              {seat.position.charAt(0).toUpperCase() + seat.position.slice(1)}
            </div>
            <div>{getSeatTypeLabel(seat.type)}</div>
            {seat.price > 0 && (
              <div className="text-green-300 font-semibold">+${seat.price}</div>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
