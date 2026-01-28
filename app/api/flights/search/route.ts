/**
 * Flight Search API Route
 * Handles flight search requests and returns mock flight data
 * Validates: Requirements 1.1, 1.7, 1.8
 */

import { NextRequest, NextResponse } from "next/server";
import { generateMockFlights } from "@/lib/data/mock-flights";
import { validateSearchCriteria } from "@/lib/validation/search";
import type { SearchCriteria, FlightSearchResponse } from "@/lib/types";
import { ZodError } from "zod";

/**
 * POST /api/flights/search
 * Search for flights based on criteria
 *
 * Validates search criteria using Zod schemas:
 * - Trip type (one-way, round-trip, multi-city)
 * - Flight segments (origin, destination, dates)
 * - Passenger counts (adults, children, infants)
 * - Cabin class (economy, business, first)
 *
 * Returns matching flights within 5 seconds (Requirement 1.8)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate search criteria using Zod schema
    // Validates: Requirements 1.1, 1.3, 1.4, 1.5, 1.6, 1.7
    const validationResult = validateSearchCriteria(body);

    if (!validationResult.success) {
      // Return validation errors with specific field-level messages
      // Validates: Requirement 1.7 (Form Validator prevents submission with specific errors)
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: "Validation failed",
          details: errors,
        },
        { status: 400 },
      );
    }

    // Extract validated search criteria
    const searchCriteria: SearchCriteria = validationResult.data;

    // Generate mock flights based on validated criteria
    // Validates: Requirement 1.8 (Return matching flights)
    const flights = generateMockFlights(searchCriteria);

    // Generate a unique search ID for this search
    const searchId = `search-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Prepare response
    const response: FlightSearchResponse = {
      flights,
      searchId,
      totalResults: flights.length,
    };

    // Simulate network delay to mimic real API (remove in production)
    // Ensures response time is within acceptable limits
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Flight search error:", error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: "Validation failed",
          details: errors,
        },
        { status: 400 },
      );
    }

    // Handle other errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 },
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: "An error occurred while searching for flights",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/flights/search
 * Not supported - use POST instead
 * Returns 405 Method Not Allowed
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "Use POST method to search for flights",
    },
    { status: 405 },
  );
}
