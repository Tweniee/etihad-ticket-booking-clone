/**
 * Price Calculation Utilities
 *
 * This module provides utilities for calculating booking prices and formatting currency.
 * Requirements: 9.1, 9.3, 9.4, 9.5
 */

import type {
  Flight,
  Seat,
  SelectedExtras,
  DetailedPriceBreakdown,
  PassengerCount,
} from "../types";

/**
 * Calculate total price from all booking components
 *
 * Requirements: 9.1, 9.3
 *
 * @param flight - Selected flight with base price
 * @param seats - Map of passenger IDs to selected seats
 * @param extras - Selected extras (baggage, meals, insurance, lounge)
 * @param passengerCount - Number of passengers (for per-passenger calculations)
 * @returns Detailed price breakdown with total
 */
export function calculateTotalPrice(
  flight: Flight | null,
  seats: Map<string, Seat>,
  extras: SelectedExtras,
  passengerCount?: PassengerCount,
): DetailedPriceBreakdown {
  const breakdown: DetailedPriceBreakdown = {
    baseFare: 0,
    taxes: 0,
    fees: 0,
    seatFees: 0,
    extraBaggage: 0,
    meals: 0,
    insurance: 0,
    loungeAccess: 0,
    total: 0,
  };

  // Base fare from selected flight
  if (flight) {
    breakdown.baseFare = flight.price.breakdown.baseFare;
    breakdown.taxes = flight.price.breakdown.taxes;
    breakdown.fees = flight.price.breakdown.fees;
  }

  // Seat fees
  seats.forEach((seat) => {
    breakdown.seatFees += seat.price;
  });

  // Extra baggage fees
  extras.baggage.forEach((baggage) => {
    breakdown.extraBaggage += baggage.price;
  });

  // Meal fees
  extras.meals.forEach((meal) => {
    breakdown.meals += meal.price;
  });

  // Insurance fee
  if (extras.insurance) {
    breakdown.insurance = extras.insurance.price;
  }

  // Lounge access fee
  if (extras.loungeAccess) {
    breakdown.loungeAccess = extras.loungeAccess.price;
  }

  // Calculate total
  breakdown.total =
    breakdown.baseFare +
    breakdown.taxes +
    breakdown.fees +
    breakdown.seatFees +
    breakdown.extraBaggage +
    breakdown.meals +
    breakdown.insurance +
    breakdown.loungeAccess;

  return breakdown;
}

/**
 * Calculate price per passenger
 *
 * Requirements: 9.5
 *
 * @param totalPrice - Total price for all passengers
 * @param passengerCount - Number of passengers
 * @returns Price per passenger
 */
export function calculatePricePerPassenger(
  totalPrice: number,
  passengerCount: PassengerCount,
): number {
  const totalPassengers =
    passengerCount.adults + passengerCount.children + passengerCount.infants;

  if (totalPassengers === 0) {
    return 0;
  }

  return totalPrice / totalPassengers;
}

/**
 * Calculate base fare per passenger (flight price only, excluding extras)
 *
 * Requirements: 9.5
 *
 * @param flight - Selected flight
 * @param passengerCount - Number of passengers
 * @returns Base fare per passenger
 */
export function calculateBaseFarePerPassenger(
  flight: Flight | null,
  passengerCount: PassengerCount,
): number {
  if (!flight) {
    return 0;
  }

  const totalPassengers =
    passengerCount.adults + passengerCount.children + passengerCount.infants;

  if (totalPassengers === 0) {
    return 0;
  }

  const baseFareTotal =
    flight.price.breakdown.baseFare +
    flight.price.breakdown.taxes +
    flight.price.breakdown.fees;

  return baseFareTotal / totalPassengers;
}

/**
 * Format currency amount with proper symbol and decimal places
 *
 * Requirements: 9.4
 *
 * @param amount - Amount to format
 * @param currency - Currency code (e.g., 'USD', 'EUR', 'AED')
 * @param locale - Locale for formatting (defaults to 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format price with currency symbol (shorthand for formatCurrency)
 *
 * Requirements: 9.4
 *
 * @param amount - Amount to format
 * @param currency - Currency code
 * @returns Formatted price string
 */
export function formatPrice(amount: number, currency: string = "USD"): string {
  return formatCurrency(amount, currency);
}

/**
 * Get currency symbol for a given currency code
 *
 * Requirements: 9.4
 *
 * @param currency - Currency code (e.g., 'USD', 'EUR', 'AED')
 * @param locale - Locale for symbol (defaults to 'en-US')
 * @returns Currency symbol
 */
export function getCurrencySymbol(
  currency: string = "USD",
  locale: string = "en-US",
): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(0);

  // Extract symbol by removing the number
  return formatted.replace(/[\d,.\s]/g, "");
}

/**
 * Calculate price breakdown for display
 * Returns an array of line items for price breakdown display
 *
 * Requirements: 9.1
 *
 * @param breakdown - Detailed price breakdown
 * @param currency - Currency code
 * @returns Array of price line items
 */
export interface PriceLineItem {
  label: string;
  amount: number;
  formattedAmount: string;
  isTotal?: boolean;
}

export function getPriceBreakdownLineItems(
  breakdown: DetailedPriceBreakdown,
  currency: string = "USD",
): PriceLineItem[] {
  const items: PriceLineItem[] = [];

  // Base fare
  if (breakdown.baseFare > 0) {
    items.push({
      label: "Base Fare",
      amount: breakdown.baseFare,
      formattedAmount: formatCurrency(breakdown.baseFare, currency),
    });
  }

  // Taxes
  if (breakdown.taxes > 0) {
    items.push({
      label: "Taxes",
      amount: breakdown.taxes,
      formattedAmount: formatCurrency(breakdown.taxes, currency),
    });
  }

  // Fees
  if (breakdown.fees > 0) {
    items.push({
      label: "Fees",
      amount: breakdown.fees,
      formattedAmount: formatCurrency(breakdown.fees, currency),
    });
  }

  // Seat fees
  if (breakdown.seatFees > 0) {
    items.push({
      label: "Seat Selection",
      amount: breakdown.seatFees,
      formattedAmount: formatCurrency(breakdown.seatFees, currency),
    });
  }

  // Extra baggage
  if (breakdown.extraBaggage > 0) {
    items.push({
      label: "Extra Baggage",
      amount: breakdown.extraBaggage,
      formattedAmount: formatCurrency(breakdown.extraBaggage, currency),
    });
  }

  // Meals
  if (breakdown.meals > 0) {
    items.push({
      label: "Meals",
      amount: breakdown.meals,
      formattedAmount: formatCurrency(breakdown.meals, currency),
    });
  }

  // Insurance
  if (breakdown.insurance > 0) {
    items.push({
      label: "Travel Insurance",
      amount: breakdown.insurance,
      formattedAmount: formatCurrency(breakdown.insurance, currency),
    });
  }

  // Lounge access
  if (breakdown.loungeAccess > 0) {
    items.push({
      label: "Lounge Access",
      amount: breakdown.loungeAccess,
      formattedAmount: formatCurrency(breakdown.loungeAccess, currency),
    });
  }

  // Total
  items.push({
    label: "Total",
    amount: breakdown.total,
    formattedAmount: formatCurrency(breakdown.total, currency),
    isTotal: true,
  });

  return items;
}

/**
 * Validate that price breakdown components sum to total
 *
 * Requirements: 9.3
 *
 * @param breakdown - Price breakdown to validate
 * @returns True if breakdown is valid, false otherwise
 */
export function validatePriceBreakdown(
  breakdown: DetailedPriceBreakdown,
): boolean {
  const calculatedTotal =
    breakdown.baseFare +
    breakdown.taxes +
    breakdown.fees +
    breakdown.seatFees +
    breakdown.extraBaggage +
    breakdown.meals +
    breakdown.insurance +
    breakdown.loungeAccess;

  // Allow for small floating point differences (within 0.01)
  return Math.abs(calculatedTotal - breakdown.total) < 0.01;
}

/**
 * Round price to 2 decimal places
 *
 * @param amount - Amount to round
 * @returns Rounded amount
 */
export function roundPrice(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Calculate percentage of total for a price component
 *
 * @param component - Component amount
 * @param total - Total amount
 * @returns Percentage (0-100)
 */
export function calculatePercentage(component: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return (component / total) * 100;
}
