/**
 * Mock Seat Map Data
 *
 * Generates seat maps for different aircraft types with realistic
 * seating configurations, availability, and pricing.
 *
 * Requirements: 6.1
 */

import type {
  SeatMap,
  Seat,
  SeatStatus,
  SeatType,
  SeatPosition,
} from "../types";

/**
 * Generate a seat with given parameters
 */
function createSeat(
  row: number,
  column: string,
  status: SeatStatus = "available",
  type: SeatType = "standard",
  position: SeatPosition,
  price: number = 0,
): Seat {
  return {
    id: `${row}${column}`,
    row,
    column,
    status,
    type,
    position,
    price,
  };
}

/**
 * Determine seat position based on column
 */
function getSeatPosition(column: string, columns: string[]): SeatPosition {
  const index = columns.indexOf(column);
  const totalColumns = columns.length;

  // For 3-3 configuration (A B C - D E F)
  if (totalColumns === 6) {
    if (column === "A" || column === "F") return "window";
    if (column === "C" || column === "D") return "aisle";
    return "middle";
  }

  // For 3-4-3 configuration (A B C - D E F G - H J K)
  if (totalColumns === 10) {
    if (column === "A" || column === "K") return "window";
    if (column === "C" || column === "D" || column === "G" || column === "H")
      return "aisle";
    return "middle";
  }

  // For 2-4-2 configuration (A B - C D E F - G H)
  if (totalColumns === 8) {
    if (column === "A" || column === "H") return "window";
    if (column === "B" || column === "C" || column === "F" || column === "G")
      return "aisle";
    return "middle";
  }

  // Default
  if (index === 0 || index === totalColumns - 1) return "window";
  if (
    index === Math.floor(totalColumns / 2) - 1 ||
    index === Math.floor(totalColumns / 2)
  )
    return "aisle";
  return "middle";
}

/**
 * Generate seats for a row
 */
function generateRowSeats(
  row: number,
  columns: string[],
  exitRows: number[],
  preferredRows: number[],
  occupiedSeats: string[] = [],
): Seat[] {
  const seats: Seat[] = [];
  const isExitRow = exitRows.includes(row);
  const isPreferredRow = preferredRows.includes(row);

  for (const column of columns) {
    const seatId = `${row}${column}`;
    const position = getSeatPosition(column, columns);

    // Determine seat type and price
    let type: SeatType = "standard";
    let price = 0;

    if (isExitRow) {
      type = "exit-row";
      price = 25; // Exit row seats cost extra
    } else if (isPreferredRow) {
      type = "preferred";
      price = 15; // Preferred seats cost extra
    } else if (row <= 5) {
      // Front rows have extra legroom
      type = "extra-legroom";
      price = 20;
    }

    // Determine status
    let status: SeatStatus = "available";
    if (occupiedSeats.includes(seatId)) {
      status = "occupied";
    }

    seats.push(createSeat(row, column, status, type, position, price));
  }

  return seats;
}

/**
 * Generate Boeing 737-800 seat map (Economy configuration)
 * 3-3 seating, 30 rows
 */
export function generateBoeing737SeatMap(): SeatMap {
  const columns = ["A", "B", "C", "D", "E", "F"];
  const rows = 30;
  const exitRows = [12, 13];
  const preferredRows = [1, 2, 3];

  // Simulate some occupied seats
  const occupiedSeats = [
    "1A",
    "1B",
    "2C",
    "3D",
    "4E",
    "5F",
    "7A",
    "8B",
    "9C",
    "10D",
    "11E",
    "14A",
    "15C",
    "16E",
    "18B",
    "19D",
    "22A",
    "23C",
    "24E",
    "25B",
    "26D",
  ];

  const seats: Seat[] = [];

  for (let row = 1; row <= rows; row++) {
    seats.push(
      ...generateRowSeats(row, columns, exitRows, preferredRows, occupiedSeats),
    );
  }

  return {
    aircraft: "Boeing 737-800",
    rows,
    columns,
    seats,
    exitRows,
  };
}

/**
 * Generate Airbus A320 seat map (Economy configuration)
 * 3-3 seating, 28 rows
 */
export function generateAirbusA320SeatMap(): SeatMap {
  const columns = ["A", "B", "C", "D", "E", "F"];
  const rows = 28;
  const exitRows = [10, 11];
  const preferredRows = [1, 2];

  const occupiedSeats = [
    "1A",
    "2B",
    "3C",
    "4D",
    "5E",
    "8A",
    "9B",
    "11C",
    "12D",
    "13E",
    "16A",
    "17B",
    "19C",
    "20D",
    "22E",
  ];

  const seats: Seat[] = [];

  for (let row = 1; row <= rows; row++) {
    seats.push(
      ...generateRowSeats(row, columns, exitRows, preferredRows, occupiedSeats),
    );
  }

  return {
    aircraft: "Airbus A320",
    rows,
    columns,
    seats,
    exitRows,
  };
}

/**
 * Generate Boeing 777-300ER seat map (Economy configuration)
 * 3-4-3 seating, 35 rows
 */
export function generateBoeing777SeatMap(): SeatMap {
  const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
  const rows = 35;
  const exitRows = [15, 16];
  const preferredRows = [1, 2, 3, 4];

  const occupiedSeats = [
    "1A",
    "1B",
    "2C",
    "2D",
    "3E",
    "3F",
    "4G",
    "4H",
    "6A",
    "7B",
    "8C",
    "9D",
    "10E",
    "11F",
    "12G",
    "17A",
    "18B",
    "19C",
    "20D",
    "21E",
    "22F",
    "25A",
    "26B",
    "27C",
    "28D",
    "29E",
    "30F",
  ];

  const seats: Seat[] = [];

  for (let row = 1; row <= rows; row++) {
    seats.push(
      ...generateRowSeats(row, columns, exitRows, preferredRows, occupiedSeats),
    );
  }

  return {
    aircraft: "Boeing 777-300ER",
    rows,
    columns,
    seats,
    exitRows,
  };
}

/**
 * Generate Airbus A380 seat map (Economy configuration)
 * 3-4-3 seating, 40 rows (lower deck)
 */
export function generateAirbusA380SeatMap(): SeatMap {
  const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
  const rows = 40;
  const exitRows = [18, 19];
  const preferredRows = [1, 2, 3, 4, 5];

  const occupiedSeats = [
    "1A",
    "1K",
    "2B",
    "2J",
    "3C",
    "3H",
    "4D",
    "4G",
    "6A",
    "7B",
    "8C",
    "9D",
    "10E",
    "11F",
    "12G",
    "13H",
    "20A",
    "21B",
    "22C",
    "23D",
    "24E",
    "25F",
    "26G",
    "30A",
    "31B",
    "32C",
    "33D",
    "34E",
    "35F",
  ];

  const seats: Seat[] = [];

  for (let row = 1; row <= rows; row++) {
    seats.push(
      ...generateRowSeats(row, columns, exitRows, preferredRows, occupiedSeats),
    );
  }

  return {
    aircraft: "Airbus A380",
    rows,
    columns,
    seats,
    exitRows,
  };
}

/**
 * Generate Boeing 787 Dreamliner seat map (Economy configuration)
 * 2-4-2 seating, 32 rows
 */
export function generateBoeing787SeatMap(): SeatMap {
  const columns = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const rows = 32;
  const exitRows = [14, 15];
  const preferredRows = [1, 2, 3];

  const occupiedSeats = [
    "1A",
    "1H",
    "2B",
    "2G",
    "3C",
    "3F",
    "5A",
    "6B",
    "7C",
    "8D",
    "9E",
    "10F",
    "16A",
    "17B",
    "18C",
    "19D",
    "20E",
    "24A",
    "25B",
    "26C",
    "27D",
    "28E",
  ];

  const seats: Seat[] = [];

  for (let row = 1; row <= rows; row++) {
    seats.push(
      ...generateRowSeats(row, columns, exitRows, preferredRows, occupiedSeats),
    );
  }

  return {
    aircraft: "Boeing 787 Dreamliner",
    rows,
    columns,
    seats,
    exitRows,
  };
}

/**
 * Get seat map by aircraft type
 */
export function getSeatMapByAircraft(aircraft: string): SeatMap {
  const aircraftLower = aircraft.toLowerCase();

  if (aircraftLower.includes("737")) {
    return generateBoeing737SeatMap();
  } else if (
    aircraftLower.includes("a320") ||
    aircraftLower.includes("airbus 320")
  ) {
    return generateAirbusA320SeatMap();
  } else if (aircraftLower.includes("777")) {
    return generateBoeing777SeatMap();
  } else if (
    aircraftLower.includes("a380") ||
    aircraftLower.includes("airbus 380")
  ) {
    return generateAirbusA380SeatMap();
  } else if (
    aircraftLower.includes("787") ||
    aircraftLower.includes("dreamliner")
  ) {
    return generateBoeing787SeatMap();
  }

  // Default to 737 if aircraft type not recognized
  return generateBoeing737SeatMap();
}

/**
 * Mock seat maps for testing
 */
export const mockSeatMaps = {
  boeing737: generateBoeing737SeatMap(),
  airbusA320: generateAirbusA320SeatMap(),
  boeing777: generateBoeing777SeatMap(),
  airbusA380: generateAirbusA380SeatMap(),
  boeing787: generateBoeing787SeatMap(),
};
