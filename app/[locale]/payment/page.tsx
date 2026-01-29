"use client";

/**
 * Payment Page
 *
 * Handles payment processing with Razorpay checkout integration
 * Displays booking summary and price breakdown
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8
 */

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/shared";
import { useBookingStore } from "@/lib/store/booking-store";

// Lazy load Payment component
const Payment = dynamic(
  () =>
    import("@/components/payment").then((mod) => ({ default: mod.Payment })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    ),
  },
);

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations();
  const { selectedFlight, passengers } = useBookingStore();

  // Redirect if no flight or passengers
  useEffect(() => {
    if (!selectedFlight) {
      router.push(`/${locale}`);
      return;
    }
    if (passengers.length === 0) {
      router.push(`/${locale}/passengers`);
    }
  }, [selectedFlight, passengers, router, locale]);

  /**
   * Handle successful payment
   */
  const handlePaymentSuccess = (
    bookingReference: string,
    paymentId: string,
  ) => {
    console.log("Payment successful:", { bookingReference, paymentId });
    // Navigation to confirmation is handled by Payment component
  };

  /**
   * Handle payment error
   */
  const handlePaymentError = (error: Error) => {
    console.error("Payment error:", error);
    // Error display is handled by Payment component
  };

  if (!selectedFlight || passengers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => router.push(`/${locale}`)}
                className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <span className="text-white font-bold text-xl">E</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("header.title")}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8">
        <Payment
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      </div>
    </div>
  );
}
