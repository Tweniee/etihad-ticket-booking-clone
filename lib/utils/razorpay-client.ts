/**
 * Razorpay Client Utility - Client-side Razorpay integration
 *
 * This utility provides functions for loading Razorpay checkout on the client side
 *
 * Requirements: 10.2, 10.8
 */

/**
 * Razorpay checkout options interface
 */
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

/**
 * Razorpay payment response interface
 */
export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Razorpay instance interface
 */
interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: any) => void) => void;
}

/**
 * Declare Razorpay on window object
 */
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

/**
 * Load Razorpay checkout script
 *
 * @returns Promise that resolves when script is loaded
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay checkout
 *
 * @param options - Razorpay checkout options
 * @returns Razorpay instance
 */
export function openRazorpayCheckout(
  options: RazorpayOptions,
): RazorpayInstance | null {
  if (!window.Razorpay) {
    console.error("Razorpay script not loaded");
    return null;
  }

  const razorpay = new window.Razorpay(options);
  razorpay.open();

  return razorpay;
}

/**
 * Create payment order via API
 *
 * @param amount - Amount in smallest currency unit
 * @param currency - Currency code
 * @param bookingReference - Optional booking reference
 * @param metadata - Optional metadata
 * @returns Order details
 */
export async function createPaymentOrder(
  amount: number,
  currency: string,
  bookingReference?: string,
  metadata?: Record<string, string>,
) {
  const response = await fetch("/api/payment/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency,
      bookingReference,
      metadata,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create payment order");
  }

  return response.json();
}

/**
 * Verify payment via API
 *
 * @param orderId - Razorpay order ID
 * @param paymentId - Razorpay payment ID
 * @param signature - Payment signature
 * @returns Verification result
 */
export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  const response = await fetch("/api/payment/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
      paymentId,
      signature,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to verify payment");
  }

  return response.json();
}
