/**
 * Seat Map API Route
 *
 * Returns seat map data for a specific flight
 *
 * Requirements: 6.1
 */

import { NextRequest, NextResponse } from "next/server";
import { getSeatMapByAircraft } from "@/lib/data/mock-seat-maps";
import type { SeatMapResponse } from "@/lib/types";

/**
 * GET /api/seats/[flightId]
 *
 * Retrieve seat map for a flight
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { flightId: string } },
) {
  try {
    const { flightId } = params;

    if (!flightId) {
      return NextResponse.json(
        { error: "Flight ID is required" },
        { status: 400 },
      );
    }

    // In a real application, we would fetch the flight details from the database
    // and determine the aircraft type. For now, we'll use a mock mapping.
    const aircraftMap: Record<string, string> = {
      FL001: "Boeing 737-800",
      FL002: "Airbus A320",
      FL003: "Boeing 777-300ER",
      FL004: "Airbus A380",
      FL005: "Boeing 787 Dreamliner",
    };

    const aircraft = aircraftMap[flightId] || "Boeing 737-800";
    const seatMap = getSeatMapByAircraft(aircraft);

    const response: SeatMapResponse = {
      flightId,
      seatMap,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching seat map:", error);
    return NextResponse.json(
      { error: "Failed to fetch seat map" },
      { status: 500 },
    );
  }
}
