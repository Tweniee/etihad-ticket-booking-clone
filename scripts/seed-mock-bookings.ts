/**
 * Script to seed mock booking data into the database
 * Usage: npx tsx scripts/seed-mock-bookings.ts
 */

import "dotenv/config";
import {
  BookingStatus,
  PaymentStatus,
  PassengerType,
  Gender,
} from "@prisma/client";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Loading mock airline data...\n");

  const dataPath = path.join(__dirname, "../lib/data/mock-airline-data.json");
  const mockData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  let totalBookings = 0;
  let totalPassengers = 0;

  for (const userData of mockData.users) {
    console.log(`Processing bookings for ${userData.userProfile.name}...`);

    for (const trip of userData.trips) {
      // Map status
      const status =
        trip.status === "Completed"
          ? BookingStatus.CONFIRMED
          : trip.status === "Cancelled"
            ? BookingStatus.CANCELLED
            : BookingStatus.PENDING;

      // Map payment status
      const paymentStatus =
        trip.payment.status === "Paid"
          ? PaymentStatus.COMPLETED
          : trip.payment.status === "Refunded"
            ? PaymentStatus.REFUNDED
            : PaymentStatus.PENDING;

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          reference: trip.pnr,
          status,
          flightId: trip.flightNumber,
          flightData: {
            flightNumber: trip.flightNumber,
            airline: trip.airline,
            aircraft: trip.aircraft,
            departure: trip.departure,
            arrival: trip.arrival,
            durationMinutes: trip.durationMinutes,
            stops: trip.stops,
            layovers: trip.layovers,
            cabinClass: trip.cabinClass,
          },
          seats: {
            passenger1: trip.seatNumber,
          },
          extras: {
            baggage: trip.baggage,
            meal: trip.mealPreference,
            specialRequests: trip.specialRequests,
          },
          totalAmount: trip.price.amount,
          currency: trip.price.currency,
          paymentId: `PAY_${trip.pnr}_${Date.now()}`,
          paymentStatus,
          passengers: {
            create: [
              {
                type: PassengerType.ADULT,
                firstName: userData.userProfile.name.split(" ")[0],
                lastName: userData.userProfile.name.split(" ")[1] || "Traveler",
                dateOfBirth: new Date("1990-01-01"),
                gender: Gender.OTHER,
                email: userData.userProfile.email,
                phone: userData.userProfile.phone,
                countryCode: "+1",
              },
            ],
          },
        },
      });

      totalBookings++;
      totalPassengers++;
    }

    console.log(`  ✓ Created ${userData.trips.length} bookings`);
  }

  console.log(
    `\n✓ Successfully seeded ${totalBookings} bookings with ${totalPassengers} passengers`,
  );
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
