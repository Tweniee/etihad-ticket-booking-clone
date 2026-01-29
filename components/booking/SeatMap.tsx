/**
 * SeatMap Component
 *
 * Interactive seat map displaying aircraft seating layout with
 * color-coded availability and seat selection functionality.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */

"use client";

import React, { useState } from "react";
import type {
  SeatMap as SeatMapType,
  Seat as SeatType,
  PassengerInfo,
} from "@/lib/types";
import { Seat } from "./Seat";
import { useSeatSelection } from "@/lib/store/booking-store";

interface SeatMapProps {
  seatMap: SeatMapType;
  passengers: PassengerInfo[];
  onContinue: () => void;
  onBack?: () => void;
}

/**
 * Get seat by row and column
 */
function getSeat(
  seatMap: SeatMapType,
  row: number,
  column: string,
): SeatType | undefined {
  return seatMap.seats.find((s) => s.row === row && s.column === column);
}

/**
 * SeatMap Component
 */
export function SeatMap({
  seatMap,
  passengers,
  onContinue,
  onBack,
}: SeatMapProps) {
  const { selectedSeats, setSeat, removeSeat } = useSeatSelection();
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);

  const currentPassenger = passengers[currentPassengerIndex];
  const currentPassengerSeat = currentPassenger
    ? selectedSeats.get(currentPassenger.id)
    : undefined;

  // Check if all passengers have seats assigned
  const allSeatsAssigned = passengers.every((p) => selectedSeats.has(p.id));

  /**
   * Handle seat selection
   * Requirements: 6.4, 6.6
   */
  const handleSeatSelect = (seat: SeatType) => {
    if (!currentPassenger) return;

    // Prevent selection of unavailable seats (Requirement 6.6)
    if (seat.status === "occupied" || seat.status === "blocked") {
      return;
    }

    // If this seat is already selected by current passenger, deselect it
    if (currentPassengerSeat?.id === seat.id) {
      removeSeat(currentPassenger.id);
      return;
    }

    // Check if seat is selected by another passenger
    const seatTakenByOther = Array.from(selectedSeats.entries()).find(
      ([passengerId, selectedSeat]) =>
        passengerId !== currentPassenger.id && selectedSeat.id === seat.id,
    );

    if (seatTakenByOther) {
      // Seat is taken by another passenger, don't allow selection
      return;
    }

    // Assign seat to current passenger (Requirement 6.4)
    setSeat(currentPassenger.id, { ...seat, status: "selected" });

    // Auto-advance to next passenger if not the last one
    if (currentPassengerIndex < passengers.length - 1) {
      setTimeout(() => {
        setCurrentPassengerIndex(currentPassengerIndex + 1);
      }, 300);
    }
  };

  /**
   * Check if a seat is selected by current passenger
   */
  const isSeatSelectedByCurrentPassenger = (seat: SeatType): boolean => {
    return currentPassengerSeat?.id === seat.id;
  };

  /**
   * Check if a seat is selected by any passenger
   */
  const isSeatSelectedByAnyPassenger = (seat: SeatType): boolean => {
    return Array.from(selectedSeats.values()).some((s) => s.id === seat.id);
  };

  /**
   * Get modified seat status for display
   */
  const getSeatForDisplay = (seat: SeatType): SeatType => {
    if (isSeatSelectedByAnyPassenger(seat)) {
      return { ...seat, status: "selected" };
    }
    return seat;
  };

  /**
   * Handle skip seat selection
   */
  const handleSkip = () => {
    onContinue();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Select Your Seats
        </h1>
        <p className="text-gray-600">
          Choose your preferred seats for {seatMap.aircraft}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Aircraft info */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {seatMap.aircraft}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {seatMap.rows} rows · {seatMap.columns.length} seats per row
                  </p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mb-6 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-100 border-2 border-gray-300 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
                <span>Extra Fee</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 border-2 border-blue-700 rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-400 border-2 border-gray-500 rounded"></div>
                <span>Occupied</span>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Column headers */}
                <div className="flex items-center justify-center mb-2">
                  <div className="w-12 text-center text-xs font-semibold text-gray-500">
                    Row
                  </div>
                  {seatMap.columns.map((col, idx) => (
                    <React.Fragment key={col}>
                      <div className="w-10 text-center text-xs font-semibold text-gray-500">
                        {col}
                      </div>
                      {/* Add aisle space after column C */}
                      {idx === 2 && <div className="w-8"></div>}
                    </React.Fragment>
                  ))}
                </div>

                {/* Seat rows */}
                <div className="space-y-2">
                  {Array.from({ length: seatMap.rows }, (_, i) => i + 1).map(
                    (row) => {
                      const isExitRow = seatMap.exitRows.includes(row);

                      return (
                        <div
                          key={row}
                          className="flex items-center justify-center"
                        >
                          {/* Row number */}
                          <div className="w-12 text-center text-sm font-semibold text-gray-700">
                            {row}
                          </div>

                          {/* Seats */}
                          {seatMap.columns.map((col, idx) => {
                            const seat = getSeat(seatMap, row, col);

                            return (
                              <React.Fragment key={col}>
                                {seat ? (
                                  <Seat
                                    seat={getSeatForDisplay(seat)}
                                    isSelected={isSeatSelectedByCurrentPassenger(
                                      seat,
                                    )}
                                    onSelect={handleSeatSelect}
                                    disabled={
                                      isSeatSelectedByAnyPassenger(seat) &&
                                      !isSeatSelectedByCurrentPassenger(seat)
                                    }
                                  />
                                ) : (
                                  <div className="w-10 h-10"></div>
                                )}
                                {/* Add aisle space after column C */}
                                {idx === 2 && <div className="w-8"></div>}
                              </React.Fragment>
                            );
                          })}

                          {/* Exit row indicator */}
                          {isExitRow && (
                            <div className="ml-2 text-xs text-red-600 font-semibold">
                              EXIT
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Selection Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Passengers
            </h3>

            {/* Passenger list */}
            <div className="space-y-3 mb-6">
              {passengers.map((passenger, index) => {
                const seat = selectedSeats.get(passenger.id);
                const isActive = index === currentPassengerIndex;

                return (
                  <button
                    key={passenger.id}
                    type="button"
                    onClick={() => setCurrentPassengerIndex(index)}
                    className={`
                      w-full text-left p-3 rounded-lg border-2 transition-all
                      ${
                        isActive
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {passenger.firstName} {passenger.lastName}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {passenger.type}
                        </div>
                      </div>
                      <div className="text-right">
                        {seat ? (
                          <div className="text-sm">
                            <div className="font-semibold text-blue-600">
                              {seat.row}
                              {seat.column}
                            </div>
                            {seat.price > 0 && (
                              <div className="text-xs text-green-600">
                                +${seat.price}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">No seat</div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Total seat fees */}
            {Array.from(selectedSeats.values()).some((s) => s.price > 0) && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Seat Fees:</span>
                  <span className="font-semibold text-gray-900">
                    $
                    {Array.from(selectedSeats.values()).reduce(
                      (sum, s) => sum + s.price,
                      0,
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={onContinue}
                disabled={!allSeatsAssigned}
                className={`
                  w-full py-3 px-4 rounded-lg font-semibold transition-colors
                  ${
                    allSeatsAssigned
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                Continue
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full py-3 px-4 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Skip Seat Selection
              </button>

              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
