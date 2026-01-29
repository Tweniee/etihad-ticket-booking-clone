/**
 * Script to generate comprehensive mock airline data
 * Usage: npx tsx scripts/generate-mock-airline-data.ts
 */

import fs from "fs";
import path from "path";

const airlines = [
  {
    name: "Emirates",
    code: "EK",
    logoUrl: "https://www.gstatic.com/flights/airline_logos/70px/EK.png",
  },
  {
    name: "Qatar Airways",
    code: "QR",
    logoUrl: "https://www.gstatic.com/flights/airline_logos/70px/QR.png",
  },
  {
    name: "Lufthansa",
    code: "LH",
    logoUrl: "https://www.gstatic.com/flights/airline_logos/70px/LH.png",
  },
  {
    name: "British Airways",
    code: "BA",
    logoUrl: "https://www.gstatic.com/flights/airline_logos/70px/BA.png",
  },
  {
    name: "Air India",
    code: "AI",
    logoUrl: "https://www.gstatic.com/flights/airline_logos/70px/AI.png",
  },
  {
    name: "IndiGo",
    code: "6E",
    logoUrl: "https://www.gstatic.com/flights/airline_logos/70px/6E.png",
  },
  {
    name: "Vistara",
    code: "UK",
    logoUrl: "https://www.gstatic.com/flights/airline_logos/70px/UK.png",
  },
  {
    name: "Delta Airlines",
    code: "DL",
    logoUrl: "https://www.gstatic.com/flights/airline_logos/70px/DL.png",
  },
  {
    name: "United Airlines",
    code: "UA",
    logoUrl: "https://www.gstatic.com/flights/airline_logos/70px/UA.png",
  },
  {
    name: "Singapore Airlines",
    code: "SQ",
    logoUrl: "https://www.gstatic.com/flights/airline_logos/70px/SQ.png",
  },
  {
    name: "Iberia",
    code: "IB",
    logoUrl: "https://www.gstatic.com/flights/airline_logos/70px/IB.png",
  },
  {
    name: "Air China",
    code: "CA",
    logoUrl: "https://www.gstatic.com/flights/airline_logos/70px/CA.png",
  },
];

const airports = [
  {
    city: "New York",
    airport: "John F. Kennedy International",
    iata: "JFK",
    currency: "USD",
  },
  {
    city: "Los Angeles",
    airport: "Los Angeles International",
    iata: "LAX",
    currency: "USD",
  },
  { city: "London", airport: "London Heathrow", iata: "LHR", currency: "GBP" },
  {
    city: "Dubai",
    airport: "Dubai International",
    iata: "DXB",
    currency: "AED",
  },
  {
    city: "Doha",
    airport: "Hamad International",
    iata: "DOH",
    currency: "QAR",
  },
  {
    city: "Delhi",
    airport: "Indira Gandhi International",
    iata: "DEL",
    currency: "INR",
  },
  {
    city: "Mumbai",
    airport: "Chhatrapati Shivaji Maharaj International",
    iata: "BOM",
    currency: "INR",
  },
  {
    city: "Barcelona",
    airport: "Barcelona-El Prat",
    iata: "BCN",
    currency: "EUR",
  },
  {
    city: "Madrid",
    airport: "Adolfo Suárez Madrid-Barajas",
    iata: "MAD",
    currency: "EUR",
  },
  {
    city: "Frankfurt",
    airport: "Frankfurt Airport",
    iata: "FRA",
    currency: "EUR",
  },
  {
    city: "Singapore",
    airport: "Singapore Changi",
    iata: "SIN",
    currency: "SGD",
  },
  {
    city: "Beijing",
    airport: "Beijing Capital International",
    iata: "PEK",
    currency: "CNY",
  },
  {
    city: "Shanghai",
    airport: "Shanghai Pudong International",
    iata: "PVG",
    currency: "CNY",
  },
];

const users = [
  { name: "John Doe", email: "john.doe@example.com", phone: "+1234567890" },
  {
    name: "Sarah Smith",
    email: "sarah.smith@example.com",
    phone: "+1234567891",
  },
  { name: "Ahmed Ali", email: "ahmed.ali@example.com", phone: "+971501234567" },
  {
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    phone: "+34612345678",
  },
  {
    name: "David Chen",
    email: "david.chen@example.com",
    phone: "+8613812345678",
  },
];

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function generatePNR(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

function generateBookingId(userInitials: string, index: number): string {
  return `BK${String(index).padStart(3, "0")}${userInitials}${new Date().getFullYear()}`;
}

function calculateDuration(dep: Date, arr: Date): number {
  return Math.floor((arr.getTime() - dep.getTime()) / 60000);
}

function generateFlight(userInitials: string, index: number, baseDate: Date) {
  const airline = airlines[Math.floor(Math.random() * airlines.length)];
  const depAirport = airports[Math.floor(Math.random() * airports.length)];
  let arrAirport = airports[Math.floor(Math.random() * airports.length)];
  while (arrAirport.iata === depAirport.iata) {
    arrAirport = airports[Math.floor(Math.random() * airports.length)];
  }

  const departureDate = randomDate(baseDate, new Date());
  const flightDuration = Math.floor(Math.random() * 600) + 180; // 3-13 hours
  const arrivalDate = new Date(
    departureDate.getTime() + flightDuration * 60000,
  );

  const cabinClasses = ["Economy", "Premium Economy", "Business"];
  const cabinClass =
    cabinClasses[Math.floor(Math.random() * cabinClasses.length)];

  const basePrice =
    cabinClass === "Business"
      ? 2500
      : cabinClass === "Premium Economy"
        ? 1200
        : 500;
  const price = basePrice + Math.floor(Math.random() * 1000);

  const statuses = [
    "Completed",
    "Completed",
    "Completed",
    "Completed",
    "Cancelled",
  ];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  const paymentMethods = ["Credit Card", "Debit Card", "UPI", "Net Banking"];
  const paymentStatus =
    status === "Cancelled"
      ? Math.random() > 0.5
        ? "Refunded"
        : "Partial Refund"
      : "Paid";

  return {
    bookingId: generateBookingId(userInitials, index),
    pnr: generatePNR(),
    airline,
    flightNumber: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
    aircraft: [
      "Boeing 777-300ER",
      "Airbus A380",
      "Boeing 787-9",
      "Airbus A350-900",
      "Boeing 767-400",
    ][Math.floor(Math.random() * 5)],
    cabinClass,
    seatNumber: `${Math.floor(Math.random() * 40) + 1}${["A", "B", "C", "D", "E", "F"][Math.floor(Math.random() * 6)]}`,
    departure: {
      ...depAirport,
      dateTime: departureDate.toISOString(),
    },
    arrival: {
      ...arrAirport,
      dateTime: arrivalDate.toISOString(),
    },
    durationMinutes: flightDuration,
    stops: Math.random() > 0.7 ? 1 : 0,
    layovers:
      Math.random() > 0.7
        ? [
            {
              city: airports[Math.floor(Math.random() * airports.length)].city,
              airport:
                airports[Math.floor(Math.random() * airports.length)].airport,
              iata: airports[Math.floor(Math.random() * airports.length)].iata,
              durationMinutes: Math.floor(Math.random() * 180) + 60,
            },
          ]
        : [],
    price: {
      amount: price,
      currency: "USD",
    },
    payment: {
      method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status: paymentStatus,
    },
    status,
    baggage: {
      checkInKg: cabinClass === "Business" ? 32 : 23,
      cabinKg: cabinClass === "Business" ? 10 : 7,
    },
    mealPreference: ["Veg", "Non-Veg", "Halal", "Kosher"][
      Math.floor(Math.random() * 4)
    ],
    specialRequests: Math.random() > 0.5 ? ["Window seat"] : [],
    carbonEmissionKg: Math.floor(flightDuration * 2.5),
  };
}

function generateUserData(user: (typeof users)[0], userIndex: number) {
  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const trips = Array.from({ length: 10 }, (_, i) =>
    generateFlight(userInitials, i + 1, twoYearsAgo),
  );

  const totalSpend = trips.reduce((sum, trip) => sum + trip.price.amount, 0);
  const airlineCounts: Record<string, number> = {};
  trips.forEach((trip) => {
    airlineCounts[trip.airline.name] =
      (airlineCounts[trip.airline.name] || 0) + 1;
  });
  const favoriteAirline = Object.entries(airlineCounts).sort(
    (a, b) => b[1] - a[1],
  )[0][0];

  const cityCounts: Record<string, number> = {};
  trips.forEach((trip) => {
    cityCounts[trip.arrival.city] = (cityCounts[trip.arrival.city] || 0) + 1;
  });
  const mostVisitedCity = Object.entries(cityCounts).sort(
    (a, b) => b[1] - a[1],
  )[0][0];

  const cabinCounts: Record<string, number> = {};
  trips.forEach((trip) => {
    cabinCounts[trip.cabinClass] = (cabinCounts[trip.cabinClass] || 0) + 1;
  });
  const preferredCabinClass = Object.entries(cabinCounts).sort(
    (a, b) => b[1] - a[1],
  )[0][0];

  const avgDuration = Math.floor(
    trips.reduce((sum, trip) => sum + trip.durationMinutes, 0) / trips.length,
  );

  return {
    userProfile: user,
    stats: {
      totalTrips: trips.length,
      totalSpend,
      favoriteAirline,
      mostVisitedCity,
      preferredCabinClass,
      averageFlightDurationMinutes: avgDuration,
      frequentFlyerPrograms: [
        {
          airline: favoriteAirline,
          memberId: `${favoriteAirline.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000000) + 1000000}`,
          tier: ["Silver", "Gold", "Platinum"][Math.floor(Math.random() * 3)],
        },
      ],
    },
    trips,
  };
}

function main() {
  console.log("Generating mock airline data for 5 users...\n");

  const data = {
    users: users.map((user, index) => generateUserData(user, index)),
  };

  const outputPath = path.join(__dirname, "../lib/data/mock-airline-data.json");
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

  console.log(`✓ Generated mock data for ${users.length} users`);
  console.log(
    `✓ Total flights: ${data.users.reduce((sum, u) => sum + u.trips.length, 0)}`,
  );
  console.log(`✓ Output: ${outputPath}\n`);

  // Print summary
  data.users.forEach((user) => {
    console.log(`${user.userProfile.name}:`);
    console.log(`  - ${user.stats.totalTrips} trips`);
    console.log(`  - $${user.stats.totalSpend} total spend`);
    console.log(`  - Favorite: ${user.stats.favoriteAirline}`);
    console.log(`  - Most visited: ${user.stats.mostVisitedCity}\n`);
  });
}

main();
