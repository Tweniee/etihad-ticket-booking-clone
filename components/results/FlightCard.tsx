"use client";

import React from "react";
import { Clock, Plane } from "lucide-react";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import type { Flight } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";

/**
 * FlightCard Component
 *
 * Displays individual flight information in a card format.
 * Shows airline logo, flight times, duration, stops, and price.
 *
 * Features:
 * - Airline logo and flight number
 * - Departure and arrival times with airports
 * - Flight duration
 * - Number of stops
 * - Price display with breakdown
 * - Clickable card for selection
 * - Accessible with keyboard navigation
 *
 * Validates Requirements:
 * - 3.1: Display each flight showing airline, flight number, departure time,
 *        arrival time, duration, number of stops, and price
 * - 3.2: Display airline logos for each flight result
 */

export interface FlightCardProps {
  /**
   * Flight data to display
   */
  flight: Flight;

  /**
   * Callback when flight is selected
   */
  onSelect: (flight: Flight) => void;

  /**
   * Whether the card is currently selected
   */
  isSelected?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

/**
 * Calculate total flight duration in minutes
 */
function calculateTotalDuration(flight: Flight): number {
  return flight.segments.reduce(
    (total, segment) => total + segment.duration,
    0,
  );
}

/**
 * Calculate number of stops
 */
function calculateStops(flight: Flight): number {
  return Math.max(0, flight.segments.length - 1);
}

/**
 * Format duration in minutes to hours and minutes
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

/**
 * Format time from Date object
 */
function formatTime(date: Date): string {
  return format(new Date(date), "HH:mm");
}

/**
 * Format date from Date object
 */
function formatDate(date: Date): string {
  return format(new Date(date), "MMM dd");
}

/**
 * Get stops text
 */
function getStopsText(stops: number): string {
  if (stops === 0) {
    return "Direct";
  }
  if (stops === 1) {
    return "1 stop";
  }
  return `${stops} stops`;
}

export function FlightCard({
  flight,
  onSelect,
  isSelected = false,
  className = "",
  testId = "flight-card",
}: FlightCardProps) {
  const firstSegment = flight.segments[0];
  const lastSegment = flight.segments[flight.segments.length - 1];
  const totalDuration = calculateTotalDuration(flight);
  const stops = calculateStops(flight);

  const handleClick = () => {
    onSelect(flight);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(flight);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "bg-white border rounded-lg p-4 sm:p-6 cursor-pointer transition-all touch-manipulation",
        "hover:shadow-lg hover:border-blue-500",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        isSelected && "border-blue-600 shadow-md bg-blue-50",
        className,
      )}
      data-testid={testId}
      aria-label={`Flight ${flight.flightNumber} from ${firstSegment.departure.airport.code} to ${lastSegment.arrival.airport.code}, ${getStopsText(stops)}, ${flight.price.currency} ${flight.price.amount}`}
    >
      <div className="flex flex-col gap-4">
        {/* Mobile/Tablet Layout */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Airline logo */}
          <div
            className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
            data-testid={`${testId}-airline-logo`}
          >
            <img
              src={flight.airline.logo}
              alt={`${flight.airline.name} logo`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                // Fallback to airline code if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded flex items-center justify-center text-gray-600 font-semibold text-xs sm:text-sm">${flight.airline.code}</div>`;
                }
              }}
            />
          </div>

          {/* Flight details */}
          <div className="flex-1 min-w-0">
            {/* Airline name and flight number */}
            <div className="mb-2 sm:mb-3">
              <h3
                className="text-xs sm:text-sm font-semibold text-gray-900"
                data-testid={`${testId}-airline-name`}
              >
                {flight.airline.name}
              </h3>
              <p
                className="text-xs text-gray-500"
                data-testid={`${testId}-flight-number`}
              >
                {flight.flightNumber}
              </p>
            </div>

            {/* Flight route and times */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Departure */}
              <div className="flex-shrink-0">
                <div
                  className="text-lg sm:text-2xl font-bold text-gray-900"
                  data-testid={`${testId}-departure-time`}
                >
                  {formatTime(firstSegment.departure.dateTime)}
                </div>
                <div
                  className="text-xs sm:text-sm text-gray-600"
                  data-testid={`${testId}-departure-airport`}
                >
                  {firstSegment.departure.airport.code}
                </div>
                <div className="text-xs text-gray-500 hidden sm:block">
                  {formatDate(firstSegment.departure.dateTime)}
                </div>
              </div>

              {/* Flight path visualization */}
              <div className="flex-1 min-w-0 flex flex-col items-center">
                <div className="w-full flex items-center justify-center gap-1 sm:gap-2 mb-1">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <Plane
                    className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transform rotate-90"
                    aria-hidden="true"
                  />
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span data-testid={`${testId}-duration`}>
                    {formatDuration(totalDuration)}
                  </span>
                </div>
                <div
                  className="text-xs text-gray-500 mt-1"
                  data-testid={`${testId}-stops`}
                >
                  {getStopsText(stops)}
                </div>
              </div>

              {/* Arrival */}
              <div className="flex-shrink-0 text-right">
                <div
                  className="text-lg sm:text-2xl font-bold text-gray-900"
                  data-testid={`${testId}-arrival-time`}
                >
                  {formatTime(lastSegment.arrival.dateTime)}
                </div>
                <div
                  className="text-xs sm:text-sm text-gray-600"
                  data-testid={`${testId}-arrival-airport`}
                >
                  {lastSegment.arrival.airport.code}
                </div>
                <div className="text-xs text-gray-500 hidden sm:block">
                  {formatDate(lastSegment.arrival.dateTime)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price section - Below on mobile, right on desktop */}
        <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:border-gray-200 sm:pl-6">
          <div className="flex flex-col sm:items-end gap-1 sm:gap-2">
            <PriceDisplay
              amount={flight.price.amount}
              currency={flight.price.currency}
              breakdown={flight.price.breakdown}
              size="large"
              testId={`${testId}-price`}
            />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="capitalize">{flight.cabinClass}</span>
              <span>•</span>
              <span>{flight.availableSeats} seats left</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
