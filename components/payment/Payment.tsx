/**
 * Payment Component
 *
 * Handles payment processing with Razorpay checkout integration
 * Displays booking summary and price breakdown
 *
 * Requirements: 10.2, 10.8
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/lib/store/booking-store";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import {
  loadRazorpayScript,
  openRazorpayCheckout,
  createPaymentOrder,
  verifyPayment,
  type RazorpayOptions,
} from "@/lib/utils/razorpay-client";

interface PaymentProps {
  onPaymentSuccess?: (bookingReference: string, paymentId: string) => void;
  onPaymentError?: (error: Error) => void;
}

export function Payment({ onPaymentSuccess, onPaymentError }: PaymentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [paymentAttempted, setPaymentAttempted] = useState(false);

  const {
    selectedFlight,
    passengers,
    selectedSeats,
    selectedExtras,
    priceBreakdown,
    totalPrice,
  } = useBookingStore();

  // Load Razorpay script on component mount
  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setScriptLoaded(loaded);
      if (!loaded) {
        setError("Failed to load payment gateway. Please refresh the page.");
      }
    });
  }, []);

  // Validate booking data
  const isBookingValid =
    selectedFlight && passengers.length > 0 && totalPrice > 0;

  /**
   * Handle payment initiation
   */
  const handlePayment = async () => {
    if (!isBookingValid) {
      setError("Invalid booking data. Please complete all steps.");
      return;
    }

    if (!scriptLoaded) {
      setError("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPaymentAttempted(true);

    try {
      // Get primary passenger for prefill
      const primaryPassenger = passengers[0];

      // Convert amount to smallest currency unit (paise for INR)
      const amountInPaise = Math.round(totalPrice * 100);

      // Create payment order
      const orderData = await createPaymentOrder(
        amountInPaise,
        selectedFlight.price.currency,
        undefined, // Booking reference will be generated after payment
        {
          flightId: selectedFlight.id,
          passengerCount: passengers.length.toString(),
        },
      );

      // Configure Razorpay checkout options
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Etihad Airways",
        description: `Flight Booking - ${selectedFlight.flightNumber}`,
        order_id: orderData.orderId,
        prefill: {
          name: `${primaryPassenger.firstName} ${primaryPassenger.lastName}`,
          email: primaryPassenger.contact?.email,
          contact: primaryPassenger.contact?.phone,
        },
        theme: {
          color: "#8B4513", // Etihad brand color
        },
        handler: async (response) => {
          // Payment successful, verify on server
          await handlePaymentSuccess(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
          );
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            setError(
              "Payment cancelled. You can retry or go back to modify your booking.",
            );
          },
        },
      };

      // Open Razorpay checkout
      const razorpayInstance = openRazorpayCheckout(options);

      if (!razorpayInstance) {
        throw new Error("Failed to open payment gateway");
      }

      // Handle payment failure
      razorpayInstance.on("payment.failed", (response: any) => {
        setIsLoading(false);
        const errorMessage =
          response.error?.description ||
          response.error?.reason ||
          "Payment failed. Please try again.";
        setError(errorMessage);
        setRetryCount((prev) => prev + 1);

        if (onPaymentError) {
          onPaymentError(new Error(errorMessage));
        }
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initiate payment";
      setError(errorMessage);
      setIsLoading(false);
      setRetryCount((prev) => prev + 1);

      if (onPaymentError) {
        onPaymentError(
          err instanceof Error ? err : new Error("Payment initiation failed"),
        );
      }
    }
  };

  /**
   * Handle successful payment
   */
  const handlePaymentSuccess = async (
    orderId: string,
    paymentId: string,
    signature: string,
  ) => {
    try {
      // Verify payment on server
      const verificationResult = await verifyPayment(
        orderId,
        paymentId,
        signature,
      );

      if (!verificationResult.success) {
        throw new Error("Payment verification failed");
      }

      // Generate booking reference (in real app, this would come from booking creation API)
      const bookingReference = `BK${Date.now().toString().slice(-6)}`;

      // Call success callback
      if (onPaymentSuccess) {
        onPaymentSuccess(bookingReference, paymentId);
      }

      // Navigate to confirmation page
      router.push(`/confirmation?ref=${bookingReference}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment verification failed";
      setError(errorMessage);
      setIsLoading(false);

      if (onPaymentError) {
        onPaymentError(
          err instanceof Error ? err : new Error("Payment verification failed"),
        );
      }
    }
  };

  /**
   * Retry payment after error
   */
  const handleRetry = () => {
    setError(null);
    handlePayment();
  };

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = (error: string): string => {
    // Map common error codes to user-friendly messages
    if (error.includes("insufficient")) {
      return "Insufficient funds. Please use a different payment method.";
    }
    if (error.includes("declined")) {
      return "Payment declined. Please check your card details or use a different card.";
    }
    if (error.includes("expired")) {
      return "Card expired. Please use a different card.";
    }
    if (error.includes("network")) {
      return "Network error. Please check your connection and try again.";
    }
    return error;
  };

  if (!isBookingValid) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorMessage
          message="Invalid booking data. Please complete all previous steps."
          onRetry={() => router.push("/search")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Payment</h1>

      {/* Booking Summary */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          Booking Summary
        </h2>

        {/* Flight Details */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2">
            Flight
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm sm:text-base font-medium">
                {selectedFlight.airline.name} {selectedFlight.flightNumber}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                {selectedFlight.segments[0].departure.airport.code} →{" "}
                {
                  selectedFlight.segments[selectedFlight.segments.length - 1]
                    .arrival.airport.code
                }
              </p>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 capitalize">
              {selectedFlight.cabinClass}
            </p>
          </div>
        </div>

        {/* Passengers */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2">
            Passengers
          </h3>
          <ul className="space-y-1">
            {passengers.map((passenger, index) => (
              <li key={passenger.id} className="text-xs sm:text-sm">
                {index + 1}. {passenger.firstName} {passenger.lastName} (
                {passenger.type})
              </li>
            ))}
          </ul>
        </div>

        {/* Seats */}
        {selectedSeats.size > 0 && (
          <div className="mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2">
              Seats
            </h3>
            <ul className="space-y-1">
              {Array.from(selectedSeats.entries()).map(
                ([passengerId, seat]) => {
                  const passenger = passengers.find(
                    (p) => p.id === passengerId,
                  );
                  return (
                    <li key={passengerId} className="text-xs sm:text-sm">
                      {passenger?.firstName} {passenger?.lastName}: Seat{" "}
                      {seat.row}
                      {seat.column}
                      {seat.price > 0 && ` (+${seat.price})`}
                    </li>
                  );
                },
              )}
            </ul>
          </div>
        )}

        {/* Extras */}
        {(selectedExtras.baggage.size > 0 ||
          selectedExtras.meals.size > 0 ||
          selectedExtras.insurance ||
          selectedExtras.loungeAccess) && (
          <div className="mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2">
              Extras
            </h3>
            <ul className="space-y-1 text-xs sm:text-sm">
              {selectedExtras.baggage.size > 0 && (
                <li>
                  Extra Baggage: {selectedExtras.baggage.size} passenger(s)
                </li>
              )}
              {selectedExtras.meals.size > 0 && (
                <li>Meals: {selectedExtras.meals.size} passenger(s)</li>
              )}
              {selectedExtras.insurance && (
                <li>
                  Travel Insurance: {selectedExtras.insurance.type} (
                  {selectedExtras.insurance.price})
                </li>
              )}
              {selectedExtras.loungeAccess && (
                <li>
                  Lounge Access: {selectedExtras.loungeAccess.airport} (
                  {selectedExtras.loungeAccess.price})
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          Price Breakdown
        </h2>
        <PriceDisplay
          amount={totalPrice}
          currency={selectedFlight.price.currency}
          breakdown={priceBreakdown}
          showBreakdown={true}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 sm:mb-6">
          <ErrorMessage
            message={getErrorMessage(error)}
            onRetry={handleRetry}
          />
          {retryCount > 0 && (
            <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center">
              Attempt {retryCount + 1}
              {retryCount >= 2 && (
                <span className="block mt-1">
                  Having trouble? Please contact support or try a different
                  payment method.
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Success Message for Payment Attempted */}
      {paymentAttempted && !error && !isLoading && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-800 text-center">
            Payment window opened. Complete your payment in the popup window.
          </p>
        </div>
      )}

      {/* Payment Button */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base touch-manipulation"
          disabled={isLoading}
        >
          Back
        </button>

        <button
          onClick={handlePayment}
          disabled={isLoading || !scriptLoaded}
          className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Processing...
            </>
          ) : (
            `Pay ${selectedFlight.price.currency} ${totalPrice.toFixed(2)}`
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
        <p>🔒 Your payment is secure and encrypted</p>
        <p className="mt-1">Powered by Razorpay</p>
      </div>
    </div>
  );
}
