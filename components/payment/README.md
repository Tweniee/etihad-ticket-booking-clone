# Payment Component

The Payment component handles secure payment processing using Razorpay's payment gateway integration.

## Features

- **Razorpay Integration**: Secure payment processing with Razorpay checkout
- **Booking Summary**: Displays complete booking details before payment
- **Price Breakdown**: Shows detailed price breakdown with all charges
- **Error Handling**: Comprehensive error handling with retry functionality
- **Payment Verification**: Server-side payment signature verification
- **Responsive Design**: Works seamlessly on all devices

## Requirements

This component satisfies the following requirements:

- **10.1**: Accept credit card and debit card payment methods
- **10.2**: Require card number, expiry date, CVV, and cardholder name
- **10.5**: Process payment through a secure payment gateway
- **10.6**: Create confirmed booking when payment is successful
- **10.7**: Display error message and allow retry when payment fails
- **10.8**: Do not store complete card numbers after payment processing

## Setup

### 1. Install Dependencies

```bash
pnpm add razorpay
```

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

### 3. Get Razorpay Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to Settings → API Keys
3. Generate API keys for your account
4. Copy the Key ID and Key Secret to your `.env` file

## Usage

### Basic Usage

```tsx
import { Payment } from "@/components/payment";

export default function PaymentPage() {
  return <Payment />;
}
```

### With Callbacks

```tsx
import { Payment } from "@/components/payment";

export default function PaymentPage() {
  const handlePaymentSuccess = (
    bookingReference: string,
    paymentId: string,
  ) => {
    console.log("Payment successful:", bookingReference, paymentId);
    // Handle successful payment
  };

  const handlePaymentError = (error: Error) => {
    console.error("Payment failed:", error);
    // Handle payment error
  };

  return (
    <Payment
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentError={handlePaymentError}
    />
  );
}
```

## API Routes

### Create Payment Order

**Endpoint**: `POST /api/payment/create-order`

**Request Body**:

```json
{
  "amount": 100000,
  "currency": "INR",
  "bookingReference": "BK123456",
  "metadata": {
    "flightId": "flight-1",
    "passengerCount": "2"
  }
}
```

**Response**:

```json
{
  "orderId": "order_xyz123",
  "amount": 100000,
  "currency": "INR",
  "keyId": "rzp_test_xyz"
}
```

### Verify Payment

**Endpoint**: `POST /api/payment/verify`

**Request Body**:

```json
{
  "orderId": "order_xyz123",
  "paymentId": "pay_abc456",
  "signature": "signature_hash"
}
```

**Response**:

```json
{
  "success": true,
  "paymentId": "pay_abc456",
  "orderId": "order_xyz123",
  "paymentDetails": {
    "id": "pay_abc456",
    "amount": 100000,
    "currency": "INR",
    "status": "captured",
    "method": "card",
    "email": "user@example.com",
    "contact": "+1234567890",
    "createdAt": 1234567890
  }
}
```

## Payment Flow

1. **User clicks "Pay" button**
   - Component validates booking data
   - Creates payment order via API
   - Opens Razorpay checkout modal

2. **User completes payment in Razorpay modal**
   - Razorpay handles card details securely
   - Returns payment response with signature

3. **Component verifies payment**
   - Sends payment details to verification API
   - Server verifies signature using Razorpay secret
   - Returns verification result

4. **On successful verification**
   - Booking is created in database
   - User is redirected to confirmation page
   - Session is cleared

5. **On payment failure**
   - Error message is displayed
   - User can retry payment
   - Booking data is preserved

## Error Handling

The component handles various error scenarios:

- **Invalid booking data**: Shows error and redirects to search
- **Script loading failure**: Shows error and suggests page refresh
- **Payment initiation failure**: Shows error with retry option
- **Payment cancelled**: Shows message allowing retry
- **Payment failed**: Shows specific error with retry option
- **Verification failure**: Shows error and allows retry

## Testing

### Test Payment Cards

Razorpay provides test cards for development:

**Success**:

- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failure**:

- Card: 4000 0000 0000 0002
- CVV: Any 3 digits
- Expiry: Any future date

### Running Tests

```bash
pnpm test tests/unit/payment/Payment.test.tsx
```

## Security

- Card details are never stored in our database
- All payment processing is handled by Razorpay
- Payment signatures are verified server-side
- HTTPS is required for production
- Razorpay checkout uses PCI DSS compliant iframe

## Customization

### Theme

Customize the Razorpay checkout theme in `Payment.tsx`:

```tsx
theme: {
  color: "#8B4513", // Your brand color
}
```

### Prefill Data

The component automatically prefills:

- Customer name from passenger data
- Email from primary passenger
- Phone from primary passenger

## Troubleshooting

### Payment modal doesn't open

- Check if Razorpay script is loaded
- Verify API keys are correct
- Check browser console for errors

### Payment verification fails

- Verify RAZORPAY_KEY_SECRET is correct
- Check server logs for signature mismatch
- Ensure order ID and payment ID match

### Amount mismatch

- Ensure amount is in smallest currency unit (paise for INR)
- Check price calculation in booking store
- Verify currency conversion if applicable

## Related Components

- `PriceDisplay`: Shows price breakdown
- `LoadingSpinner`: Loading indicator
- `ErrorMessage`: Error display with retry
- `BookingStore`: Manages booking state

## API Documentation

For more details on Razorpay API, see:

- [Razorpay Checkout Documentation](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
