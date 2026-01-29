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
import { generateCacheKey, withCache, CACHE_TTL } from "@/lib/utils/cache";

/**
 * GET /api/seats/[flightId]
 *
 * Retrieve seat map for a flight
 * Implements caching for seat map data
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

    // Generate cache key for this flight's seat map
    const cacheKey = generateCacheKey("seat-map", { flightId });

    // Use cache wrapper to get or generate seat map
    const seatMapData = await withCache(
      cacheKey,
      CACHE_TTL.SEAT_MAP,
      async () => {
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

        return { flightId, seatMap };
      },
    );

    const response: SeatMapResponse = seatMapData;

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching seat map:", error);
    return NextResponse.json(
      { error: "Failed to fetch seat map" },
      { status: 500 },
    );
  }
}
