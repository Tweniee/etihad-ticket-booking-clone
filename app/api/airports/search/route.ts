/**
 * Airport Search API Route
 * Handles airport autocomplete search requests
 */

import { NextRequest, NextResponse } from "next/server";
import { searchAirports } from "@/lib/data/mock-flights";
import { generateCacheKey, withCache, CACHE_TTL } from "@/lib/utils/cache";

/**
 * GET /api/airports/search?q=query
 * Search for airports by city, name, or IATA code
 * Implements caching for static airport data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    // Validate query parameter
    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 },
      );
    }

    // Require at least 2 characters as per requirement 2.1
    if (query.length < 2) {
      return NextResponse.json({ airports: [] }, { status: 200 });
    }

    // Generate cache key for this search query
    const cacheKey = generateCacheKey("airport-search", {
      query: query.toLowerCase(),
    });

    // Use cache wrapper to get or search airports
    const airports = await withCache(cacheKey, CACHE_TTL.AIRPORTS, async () =>
      searchAirports(query),
    );

    return NextResponse.json({ airports }, { status: 200 });
  } catch (error) {
    console.error("Airport search error:", error);

    return NextResponse.json(
      { error: "An error occurred while searching for airports" },
      { status: 500 },
    );
  }
}
