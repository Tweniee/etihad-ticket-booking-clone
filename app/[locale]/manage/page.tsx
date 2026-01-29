/**
 * Manage Booking Page
 *
 * Allows users to retrieve and manage their bookings
 *
 * Requirements: 12.1, 12.2, 12.3
 */

"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import type { Flight, Seat, ModificationOption } from "@/lib/types";

interface BookingData {
  id: string;
  reference: string;
  status: string;
  flightData: Flight;
  passengers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    type: string;
    email?: string;
    dateOfBirth: string;
    gender: string;
  }>;
  seats: Record<string, Seat>;
  extras: any;
  totalAmount: string;
  currency: string;
  paymentId: string;
  paymentStatus: string;
  createdAt: string;
}

export default function ManageBookingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations();
  const [bookingReference, setBookingReference] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [modificationOptions, setModificationOptions] = useState<
    ModificationOption[]
  >([]);

  const handleRetrieveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/bookings/${bookingReference.toUpperCase()}?lastName=${encodeURIComponent(lastName)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve booking");
      }

      if (data.success && data.booking) {
        setBookingData(data.booking);
        setModificationOptions(data.modificationOptions || []);
      } else {
        throw new Error("Invalid booking data");
      }
    } catch (err) {
      console.error("Error retrieving booking:", err);
      setError(
        err instanceof Error ? err.message : "Failed to retrieve booking",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBookingData(null);
    setModificationOptions([]);
    setBookingReference("");
    setLastName("");
    setError(null);
  };

  if (bookingData) {
    return (
      <BookingDetails
        booking={bookingData}
        modificationOptions={modificationOptions}
        onBack={handleReset}
        locale={locale}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2">{t("manageBooking.title")}</h1>
        <p className="text-gray-600 mb-6">{t("manageBooking.subtitle")}</p>

        <form onSubmit={handleRetrieveBooking} className="space-y-4">
          <div>
            <label
              htmlFor="bookingReference"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("manageBooking.bookingReference")}
            </label>
            <input
              type="text"
              id="bookingReference"
              value={bookingReference}
              onChange={(e) =>
                setBookingReference(e.target.value.toUpperCase())
              }
              placeholder="e.g., ABC123"
              maxLength={6}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("manageBooking.referenceHelp")}
            </p>
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("manageBooking.lastName")}
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t("manageBooking.lastNamePlaceholder")}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("manageBooking.lastNameHelp")}
            </p>
          </div>

          {error && (
            <ErrorMessage message={error} onRetry={() => setError(null)} />
          )}

          <button
            type="submit"
            disabled={isLoading || !bookingReference || !lastName}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">{t("manageBooking.retrieving")}</span>
              </>
            ) : (
              t("manageBooking.retrieve")
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 text-center">
            {t("manageBooking.noReference")}{" "}
            <a href="#" className="text-blue-600 hover:underline">
              {t("manageBooking.contactSupport")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

interface BookingDetailsProps {
  booking: BookingData;
  modificationOptions: ModificationOption[];
  onBack: () => void;
  locale: string;
}

function BookingDetails({
  booking,
  modificationOptions,
  onBack,
  locale,
}: BookingDetailsProps) {
  const router = useRouter();
  const t = useTranslations();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const flight = booking.flightData;
  const passengers = booking.passengers;
  const seats = booking.seats;

  // Calculate price breakdown
  const baseFare = flight.price.breakdown.baseFare * passengers.length;
  const taxes = flight.price.breakdown.taxes * passengers.length;
  const fees = flight.price.breakdown.fees * passengers.length;

  let seatFees = 0;
  Object.values(seats).forEach((seat) => {
    seatFees += seat.price || 0;
  });

  const extras = booking.extras;
  let extraBaggage = 0;
  let meals = 0;
  let insurance = 0;
  let loungeAccess = 0;

  if (extras.baggage) {
    Object.values(extras.baggage).forEach((bag: any) => {
      extraBaggage += bag.price || 0;
    });
  }

  if (extras.meals) {
    Object.values(extras.meals).forEach((meal: any) => {
      meals += meal.price || 0;
    });
  }

  if (extras.insurance) {
    insurance = extras.insurance.price || 0;
  }

  if (extras.loungeAccess) {
    loungeAccess = extras.loungeAccess.price || 0;
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      CONFIRMED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 flex items-center mb-4"
        >
          ← {t("manageBooking.backToSearch")}
        </button>
        <h1 className="text-3xl font-bold">{t("manageBooking.details")}</h1>
      </div>

      {/* Booking Reference and Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {t("manageBooking.bookingReference")}
            </h2>
            <p className="text-3xl font-bold text-blue-600 tracking-wider">
              {booking.reference}
            </p>
          </div>
          <div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(booking.status)}`}
            >
              {booking.status}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {t("manageBooking.bookedOn")}{" "}
          {new Date(booking.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Flight Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {t("manageBooking.flightDetails")}
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">{t("confirmation.airline")}</span>
            <span className="font-medium">{flight.airline.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">
              {t("confirmation.flightNumber")}
            </span>
            <span className="font-medium">{flight.flightNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("confirmation.route")}</span>
            <span className="font-medium">
              {flight.segments[0].departure.airport.code} →{" "}
              {flight.segments[flight.segments.length - 1].arrival.airport.code}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("confirmation.departure")}</span>
            <span className="font-medium">
              {new Date(flight.segments[0].departure.dateTime).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("confirmation.arrival")}</span>
            <span className="font-medium">
              {new Date(
                flight.segments[flight.segments.length - 1].arrival.dateTime,
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("confirmation.cabin")}</span>
            <span className="font-medium capitalize">{flight.cabinClass}</span>
          </div>
        </div>
      </div>

      {/* Passenger Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {t("confirmation.passengers")}
        </h2>
        <div className="space-y-3">
          {passengers.map((passenger, index) => {
            const seatInfo = seats[passenger.id];
            return (
              <div key={passenger.id} className="border-b pb-3 last:border-b-0">
                <p className="font-medium">
                  {index + 1}. {passenger.firstName} {passenger.lastName}
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  {passenger.type.toLowerCase()}
                  {seatInfo && (
                    <span className="ml-2">
                      • {t("confirmation.seat")} {seatInfo.row}
                      {seatInfo.column}
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {t("confirmation.paymentSummary")}
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t("confirmation.baseFare")}</span>
            <span>
              {booking.currency} {baseFare.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t("confirmation.taxesFees")}</span>
            <span>
              {booking.currency} {(taxes + fees).toFixed(2)}
            </span>
          </div>
          {seatFees > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {t("confirmation.seatFees")}
              </span>
              <span>
                {booking.currency} {seatFees.toFixed(2)}
              </span>
            </div>
          )}
          {(extraBaggage > 0 ||
            meals > 0 ||
            insurance > 0 ||
            loungeAccess > 0) && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t("confirmation.extras")}</span>
              <span>
                {booking.currency}{" "}
                {(extraBaggage + meals + insurance + loungeAccess).toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>{t("confirmation.totalPaid")}</span>
              <span className="text-green-600">
                {booking.currency} {parseFloat(booking.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modification Options */}
      {booking.status !== "CANCELLED" && modificationOptions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {t("manageBooking.manageYourBooking")}
          </h2>
          <div className="space-y-3">
            {modificationOptions.map((option) => (
              <div
                key={option.type}
                className={`flex justify-between items-center p-4 border rounded-lg ${
                  option.available
                    ? "border-gray-300 hover:border-blue-500 cursor-pointer"
                    : "border-gray-200 bg-gray-50 cursor-not-allowed"
                }`}
              >
                <div>
                  <p className="font-medium">
                    {option.type === "change-flight" &&
                      t("manageBooking.changeFlight")}
                    {option.type === "change-seats" &&
                      t("manageBooking.changeSeats")}
                    {option.type === "add-extras" &&
                      t("manageBooking.addExtras")}
                  </p>
                  {option.available && option.fee > 0 && (
                    <p className="text-sm text-gray-600">
                      {t("manageBooking.fee")}: {booking.currency}{" "}
                      {option.fee.toFixed(2)}
                    </p>
                  )}
                  {!option.available && (
                    <p className="text-sm text-gray-500">
                      {t("manageBooking.notAvailable")}
                    </p>
                  )}
                </div>
                <button
                  disabled={!option.available}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {option.available
                    ? t("manageBooking.modify")
                    : t("manageBooking.unavailable")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() =>
            router.push(`/${locale}/confirmation?ref=${booking.reference}`)
          }
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t("manageBooking.viewConfirmation")}
        </button>
        {booking.status !== "CANCELLED" && (
          <button
            onClick={() => setShowCancelDialog(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t("manageBooking.cancelBooking")}
          </button>
        )}
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <CancelBookingDialog
          booking={booking}
          onClose={() => setShowCancelDialog(false)}
          onSuccess={onBack}
          locale={locale}
        />
      )}
    </div>
  );
}

interface CancelBookingDialogProps {
  booking: BookingData;
  onClose: () => void;
  onSuccess: () => void;
  locale: string;
}

function CancelBookingDialog({
  booking,
  onClose,
  onSuccess,
  locale,
}: CancelBookingDialogProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellationFee, setCancellationFee] = useState<number | null>(null);
  const [refundAmount, setRefundAmount] = useState<number | null>(null);

  // Calculate estimated cancellation fee
  const flightData = booking.flightData as any;
  const fareRules = flightData.fareRules || {};
  const estimatedFee =
    fareRules.cancellationFee || parseFloat(booking.totalAmount) * 0.2;
  const estimatedRefund = parseFloat(booking.totalAmount) - estimatedFee;

  const handleCancel = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const primaryPassenger = booking.passengers.find((p) => p.email);
      if (!primaryPassenger) {
        throw new Error("No primary passenger found");
      }

      const response = await fetch(
        `/api/bookings/${booking.reference}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lastName: primaryPassenger.lastName,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      if (data.success) {
        setCancellationFee(data.cancellationFee);
        setRefundAmount(data.refundAmount);
        // Show success message for 2 seconds then close
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        throw new Error("Cancellation failed");
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setIsLoading(false);
    }
  };

  if (cancellationFee !== null && refundAmount !== null) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h3 className="text-xl font-bold mb-4">
              {t("manageBooking.bookingCancelled")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("manageBooking.cancelSuccess")}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  {t("manageBooking.cancellationFee")}
                </span>
                <span className="font-medium">
                  {booking.currency} {cancellationFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("manageBooking.refundAmount")}
                </span>
                <span className="font-medium text-green-600">
                  {booking.currency} {refundAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {t("manageBooking.emailConfirmation")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">
          {t("manageBooking.cancelBooking")}
        </h3>
        <p className="text-gray-600 mb-4">
          {t("manageBooking.cancelConfirmation")}
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            {t("manageBooking.cancellationPolicy")}
          </p>
          <div className="space-y-1 text-sm text-yellow-700">
            <div className="flex justify-between">
              <span>{t("manageBooking.cancellationFee")}:</span>
              <span className="font-medium">
                {booking.currency} {estimatedFee.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("manageBooking.refundAmount")}:</span>
              <span className="font-medium">
                {booking.currency} {estimatedRefund.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onRetry={() => setError(null)} />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t("manageBooking.keepBooking")}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">{t("manageBooking.cancelling")}</span>
              </>
            ) : (
              t("manageBooking.confirmCancel")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
