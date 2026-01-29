/**
 * Email service exports
 */

export {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
  validateSendGridConfig,
  type BookingConfirmationData,
  type BookingCancellationData,
  type EmailTemplate,
} from "./sendgrid";
