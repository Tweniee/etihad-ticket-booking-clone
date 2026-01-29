/**
 * SendGrid Email Service
 * Handles email sending for booking confirmations and cancellations
 */

import sgMail from "@sendgrid/mail";
import { Booking, PassengerInfo, Flight, Seat } from "@/lib/types";
import { format } from "date-fns";

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL =
  process.env.SENDGRID_FROM_EMAIL || "noreply@etihad-booking.com";

/**
 * Email template types
 */
export type EmailTemplate = "booking-confirmation" | "booking-cancellation";

/**
 * Email data for booking confirmation
 */
export interface BookingConfirmationData {
  booking: Booking;
  primaryPassenger: PassengerInfo;
}

/**
 * Email data for booking cancellation
 */
export interface BookingCancellationData {
  bookingReference: string;
  passengerName: string;
  flightDetails: string;
  cancellationFee: number;
  refundAmount: number;
  currency: string;
}

/**
 * Generate HTML email template for booking confirmation
 */
function generateBookingConfirmationHTML(
  data: BookingConfirmationData,
): string {
  const { booking, primaryPassenger } = data;
  const flight = booking.flight;

  // Format dates
  const departureDate = format(
    new Date(flight.segments[0].departure.dateTime),
    "EEEE, MMMM d, yyyy",
  );
  const departureTime = format(
    new Date(flight.segments[0].departure.dateTime),
    "h:mm a",
  );
  const arrivalTime = format(
    new Date(flight.segments[flight.segments.length - 1].arrival.dateTime),
    "h:mm a",
  );

  // Build passenger list
  const passengerList = booking.passengers
    .map((p) => `<li>${p.firstName} ${p.lastName} (${p.type})</li>`)
    .join("");

  // Build seat assignments
  const seatAssignments = booking.passengers
    .map((p) => {
      const seat = booking.seats.get(p.id);
      return seat
        ? `<li>${p.firstName} ${p.lastName}: Seat ${seat.row}${seat.column}</li>`
        : "";
    })
    .filter(Boolean)
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #8B4513;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    .booking-ref {
      font-size: 24px;
      font-weight: bold;
      color: #8B4513;
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background-color: #fff;
      border: 2px dashed #8B4513;
      border-radius: 5px;
    }
    .section {
      margin: 20px 0;
      padding: 15px;
      background-color: white;
      border-radius: 5px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #8B4513;
      margin-bottom: 10px;
      border-bottom: 2px solid #8B4513;
      padding-bottom: 5px;
    }
    .flight-info {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
    }
    .price-total {
      font-size: 20px;
      font-weight: bold;
      color: #8B4513;
      text-align: right;
      margin-top: 15px;
    }
    ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Booking Confirmation</h1>
  </div>
  
  <div class="content">
    <p>Dear ${primaryPassenger.firstName} ${primaryPassenger.lastName},</p>
    
    <p>Thank you for booking with us! Your flight has been confirmed.</p>
    
    <div class="booking-ref">
      Booking Reference: ${booking.reference}
    </div>
    
    <div class="section">
      <div class="section-title">Flight Details</div>
      <p><strong>Flight:</strong> ${flight.airline.name} ${flight.flightNumber}</p>
      <p><strong>Date:</strong> ${departureDate}</p>
      <p><strong>Route:</strong> ${flight.segments[0].departure.airport.city} (${flight.segments[0].departure.airport.code}) → ${flight.segments[flight.segments.length - 1].arrival.airport.city} (${flight.segments[flight.segments.length - 1].arrival.airport.code})</p>
      <p><strong>Departure:</strong> ${departureTime} from Terminal ${flight.segments[0].departure.terminal || "TBA"}</p>
      <p><strong>Arrival:</strong> ${arrivalTime} at Terminal ${flight.segments[flight.segments.length - 1].arrival.terminal || "TBA"}</p>
      <p><strong>Cabin Class:</strong> ${flight.cabinClass}</p>
    </div>
    
    <div class="section">
      <div class="section-title">Passengers</div>
      <ul>
        ${passengerList}
      </ul>
    </div>
    
    ${
      seatAssignments
        ? `
    <div class="section">
      <div class="section-title">Seat Assignments</div>
      <ul>
        ${seatAssignments}
      </ul>
    </div>
    `
        : ""
    }
    
    <div class="section">
      <div class="section-title">Payment Summary</div>
      <p><strong>Base Fare:</strong> ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}</p>
      <div class="price-total">
        Total Paid: ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}
      </div>
      <p><strong>Payment Method:</strong> ${booking.payment.method}</p>
      <p><strong>Transaction ID:</strong> ${booking.payment.transactionId}</p>
    </div>
    
    <div class="section">
      <div class="section-title">Important Information</div>
      <ul>
        <li>Please arrive at the airport at least 3 hours before departure for international flights</li>
        <li>Check-in opens 24 hours before departure</li>
        <li>Please bring a valid ID and passport for international travel</li>
        <li>Your booking reference is required for check-in</li>
      </ul>
    </div>
    
    <p>If you need to manage your booking, please visit our website and use your booking reference.</p>
    
    <p>We look forward to welcoming you aboard!</p>
    
    <p>Best regards,<br>The Etihad Booking Team</p>
  </div>
  
  <div class="footer">
    <p>This is an automated email. Please do not reply to this message.</p>
    <p>© ${new Date().getFullYear()} Etihad Booking System. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML email template for booking cancellation
 */
function generateBookingCancellationHTML(
  data: BookingCancellationData,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancellation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #8B4513;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    .booking-ref {
      font-size: 24px;
      font-weight: bold;
      color: #d9534f;
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background-color: #fff;
      border: 2px dashed #d9534f;
      border-radius: 5px;
    }
    .section {
      margin: 20px 0;
      padding: 15px;
      background-color: white;
      border-radius: 5px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #8B4513;
      margin-bottom: 10px;
      border-bottom: 2px solid #8B4513;
      padding-bottom: 5px;
    }
    .refund-info {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Booking Cancellation Confirmation</h1>
  </div>
  
  <div class="content">
    <p>Dear ${data.passengerName},</p>
    
    <p>Your booking has been successfully cancelled.</p>
    
    <div class="booking-ref">
      Booking Reference: ${data.bookingReference}
    </div>
    
    <div class="section">
      <div class="section-title">Cancelled Flight</div>
      <p>${data.flightDetails}</p>
    </div>
    
    <div class="section">
      <div class="section-title">Refund Information</div>
      <div class="refund-info">
        <p><strong>Cancellation Fee:</strong> ${data.currency} ${data.cancellationFee.toFixed(2)}</p>
        <p><strong>Refund Amount:</strong> ${data.currency} ${data.refundAmount.toFixed(2)}</p>
        <p style="margin-top: 10px; font-size: 14px;">
          The refund will be processed to your original payment method within 7-10 business days.
        </p>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">What's Next?</div>
      <ul>
        <li>You will receive the refund in your original payment method</li>
        <li>Please allow 7-10 business days for the refund to appear</li>
        <li>If you have any questions, please contact our support team</li>
      </ul>
    </div>
    
    <p>We're sorry to see you cancel your booking. We hope to serve you again in the future.</p>
    
    <p>Best regards,<br>The Etihad Booking Team</p>
  </div>
  
  <div class="footer">
    <p>This is an automated email. Please do not reply to this message.</p>
    <p>© ${new Date().getFullYear()} Etihad Booking System. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  data: BookingConfirmationData,
): Promise<void> {
  const { booking, primaryPassenger } = data;

  if (!primaryPassenger.contact?.email) {
    throw new Error("Primary passenger email is required");
  }

  const htmlContent = generateBookingConfirmationHTML(data);

  const msg = {
    to: primaryPassenger.contact.email,
    from: FROM_EMAIL,
    subject: `Booking Confirmation - ${booking.reference}`,
    html: htmlContent,
    text: `Your booking has been confirmed. Booking Reference: ${booking.reference}`,
  };

  try {
    await sgMail.send(msg);
    console.log(`Confirmation email sent to ${primaryPassenger.contact.email}`);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw new Error("Failed to send confirmation email");
  }
}

/**
 * Send booking cancellation email
 */
export async function sendBookingCancellationEmail(
  email: string,
  data: BookingCancellationData,
): Promise<void> {
  if (!email) {
    throw new Error("Email address is required");
  }

  const htmlContent = generateBookingCancellationHTML(data);

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: `Booking Cancellation - ${data.bookingReference}`,
    html: htmlContent,
    text: `Your booking ${data.bookingReference} has been cancelled. Refund amount: ${data.currency} ${data.refundAmount.toFixed(2)}`,
  };

  try {
    await sgMail.send(msg);
    console.log(`Cancellation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    throw new Error("Failed to send cancellation email");
  }
}

/**
 * Validate SendGrid configuration
 */
export function validateSendGridConfig(): boolean {
  return !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL);
}
