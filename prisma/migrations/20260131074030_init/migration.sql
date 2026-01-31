/*
  Warnings:

  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Passenger` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Passenger" DROP CONSTRAINT "Passenger_bookingId_fkey";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "Passenger";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "BookingStatus";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "PassengerType";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "user_info" (
    "user_id" SERIAL NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "citizenship" VARCHAR(50) NOT NULL,
    "uae_resident" BOOLEAN NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_info_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "travel_history" (
    "travel_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "destination" VARCHAR(50) NOT NULL,
    "travel_date" DATE NOT NULL,
    "purpose" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_history_pkey" PRIMARY KEY ("travel_id")
);

-- CreateIndex
CREATE INDEX "travel_history_user_id_idx" ON "travel_history"("user_id");

-- AddForeignKey
ALTER TABLE "travel_history" ADD CONSTRAINT "travel_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_info"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
