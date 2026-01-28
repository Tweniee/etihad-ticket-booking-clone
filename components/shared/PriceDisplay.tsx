"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import type { DetailedPriceBreakdown, PriceBreakdown } from "@/lib/types";

/**
 * PriceDisplay Component
 *
 * Displays formatted currency with optional breakdown tooltip.
 * Supports both simple and detailed price breakdowns.
 *
 * Features:
 * - Formatted currency display
 * - Breakdown tooltip on hover/click
 * - Highlight animation on price changes
 * - Per-passenger and total price display
 * - Accessible with keyboard navigation
 *
 * Validates Requirements:
 * - 9.1: Display base fare, taxes, fees, and extras as separate line items
 * - 9.4: Display all prices in the user's selected currency
 * - 9.5: Display price per passenger and total price for all passengers
 * - 19.4: Display a price breakdown showing how the total is calculated
 */

export interface PriceDisplayProps {
  /**
   * Total price amount
   */
  amount: number;

  /**
   * Currency code (e.g., "USD", "EUR", "AED")
   */
  currency: string;

  /**
   * Optional price breakdown to show in tooltip
   */
  breakdown?: PriceBreakdown | DetailedPriceBreakdown;

  /**
   * Number of passengers (for per-passenger calculation)
   */
  passengerCount?: number;

  /**
   * Whether to show the breakdown tooltip
   * @default true
   */
  showBreakdown?: boolean;

  /**
   * Size variant
   * @default "medium"
   */
  size?: "small" | "medium" | "large";

  /**
   * Whether to highlight the price (e.g., on change)
   * @default false
   */
  highlight?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Label to display before the price
   */
  label?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

/**
 * Format currency amount with proper locale and currency symbol
 */
function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Check if breakdown is detailed (has extra fields)
 */
function isDetailedBreakdown(
  breakdown: PriceBreakdown | DetailedPriceBreakdown,
): breakdown is DetailedPriceBreakdown {
  return "seatFees" in breakdown;
}

export function PriceDisplay({
  amount,
  currency,
  breakdown,
  passengerCount,
  showBreakdown = true,
  size = "medium",
  highlight = false,
  className = "",
  label,
  testId = "price-display",
}: PriceDisplayProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle highlight animation
  useEffect(() => {
    if (highlight) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [highlight, amount]);

  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    }

    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTooltip]);

  // Size classes
  const sizeClasses = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-2xl font-bold",
  };

  // Calculate per-passenger price if passenger count is provided
  const perPassengerPrice =
    passengerCount && passengerCount > 1 ? amount / passengerCount : null;

  const formattedTotal = formatCurrency(amount, currency);
  const formattedPerPassenger = perPassengerPrice
    ? formatCurrency(perPassengerPrice, currency)
    : null;

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      data-testid={testId}
    >
      <div className="flex flex-col">
        {label && (
          <span
            className="text-sm text-gray-600 mb-1"
            data-testid={`${testId}-label`}
          >
            {label}
          </span>
        )}
        <div className="flex items-baseline gap-2">
          <span
            className={`font-semibold ${sizeClasses[size]} ${
              isHighlighted
                ? "text-green-600 transition-colors duration-300"
                : "text-gray-900"
            }`}
            data-testid={`${testId}-amount`}
            aria-label={`Total price: ${formattedTotal}`}
          >
            {formattedTotal}
          </span>
          {formattedPerPassenger && (
            <span
              className="text-sm text-gray-500"
              data-testid={`${testId}-per-passenger`}
              aria-label={`Price per passenger: ${formattedPerPassenger}`}
            >
              ({formattedPerPassenger} per person)
            </span>
          )}
        </div>
      </div>

      {showBreakdown && breakdown && (
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setShowTooltip(!showTooltip)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowTooltip(false);
              }
            }}
            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Show price breakdown"
            aria-expanded={showTooltip}
            aria-haspopup="true"
            data-testid={`${testId}-breakdown-button`}
          >
            <Info className="w-4 h-4 text-gray-500" aria-hidden="true" />
          </button>

          {showTooltip && (
            <div
              ref={tooltipRef}
              role="tooltip"
              className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
              data-testid={`${testId}-breakdown-tooltip`}
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Price Breakdown
              </h3>
              <div className="space-y-2 text-sm">
                {/* Base fare */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(breakdown.baseFare, currency)}
                  </span>
                </div>

                {/* Taxes */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(breakdown.taxes, currency)}
                  </span>
                </div>

                {/* Fees */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Fees</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(breakdown.fees, currency)}
                  </span>
                </div>

                {/* Detailed breakdown items */}
                {isDetailedBreakdown(breakdown) && (
                  <>
                    {breakdown.seatFees > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seat Fees</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(breakdown.seatFees, currency)}
                        </span>
                      </div>
                    )}

                    {breakdown.extraBaggage > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Extra Baggage</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(breakdown.extraBaggage, currency)}
                        </span>
                      </div>
                    )}

                    {breakdown.meals > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Meals</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(breakdown.meals, currency)}
                        </span>
                      </div>
                    )}

                    {breakdown.insurance > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Insurance</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(breakdown.insurance, currency)}
                        </span>
                      </div>
                    )}

                    {breakdown.loungeAccess > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lounge Access</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(breakdown.loungeAccess, currency)}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Total */}
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(amount, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
