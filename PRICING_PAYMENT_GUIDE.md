# Pricing & Payment System

## Overview
Complete financial tracking system for all bookings with unit pricing, discounts, taxes, and comprehensive payment status management.

---

## Core Components

### 1. Pricing Structure

Every booking has detailed pricing breakdown:

```typescript
pricing: {
  unitPrice: number;        // Price per unit (per night, per person, per service)
  quantity: number;         // Number of units (nights, passengers, items)
  subtotal: number;         // unitPrice × quantity
  discount: {
    type: 'percentage' | 'fixed' | 'coupon' | 'seasonal';
    value: number;          // Percentage (0-100) or fixed amount
    code: string;           // Discount/Coupon code
    reason: string;         // Reason for discount
  };
  discountAmount: number;   // Calculated discount amount
  taxRate: number;          // Tax/VAT rate percentage (default: 15% for Vanuatu)
  taxAmount: number;        // Calculated tax amount
  totalAmount: number;      // Final amount: subtotal - discount + tax
  currency: string;         // VUV, USD, AUD, etc.
}
```

### 2. Payment Tracking

Comprehensive payment status and history:

```typescript
payment: {
  status: 'unpaid' | 'partial' | 'paid' | 'refunded' | 'failed';
  method: 'cash' | 'card' | 'mobile' | 'transfer' | 'paypal' | 'stripe';
  reference: string;        // Payment reference number (PAY-YYYYMMDD-XXXXXX)
  transactionId: string;    // Transaction ID (TXN-TIMESTAMP-XXXX)
  paidAmount: number;       // Total amount paid so far
  remainingAmount: number;  // Amount still owed
  paidAt: Date;            // When full payment was received
  refundAmount: number;     // Amount refunded
  refundReason: string;     // Reason for refund
  refundedAt: Date;        // When refund was processed
  paymentDetails: {
    cardLastFour: string;   // Last 4 digits of card
    cardBrand: string;      // Visa, Mastercard, Amex, etc.
    mobileProvider: string; // Mobile money provider
    accountNumber: string;  // Bank account for transfers
  };
}
```

---

## Pricing Calculation

### Automatic Calculation Flow:

```
1. Unit Price × Quantity = Subtotal
2. Subtotal - Discount = Amount After Discount
3. Amount After Discount × Tax Rate = Tax Amount
4. Amount After Discount + Tax = Total Amount
```

### Example:

**Hotel Booking:**
- Unit Price (per night): 50,000 VUV
- Quantity (nights): 3
- Discount Code: WELCOME10 (10%)
- Tax Rate: 15%

**Calculation:**
```
Subtotal:        50,000 × 3 = 150,000 VUV
Discount (10%):  150,000 × 0.10 = 15,000 VUV
After Discount:  150,000 - 15,000 = 135,000 VUV
Tax (15%):       135,000 × 0.15 = 20,250 VUV
Total Amount:    135,000 + 20,250 = 155,250 VUV
```

---

## Payment Status Workflow

### Status Transitions:

```
unpaid → partial → paid → refunded
   ↓        ↓       ↓
 failed   failed  failed
```

**Status Definitions:**
- **unpaid**: No payment received (paidAmount = 0)
- **partial**: Some payment received but not full amount (0 < paidAmount < totalAmount)
- **paid**: Full payment received (paidAmount = totalAmount)
- **refunded**: Payment was refunded (refundAmount > 0)
- **failed**: Payment attempt failed

---

## API Endpoints

### 1. Calculate Pricing

**Endpoint**: `POST /api/payments/calculate`

**Purpose**: Calculate pricing with discount and tax

**Request**:
```json
{
  "unitPrice": 50000,
  "quantity": 3,
  "discount": {
    "type": "percentage",
    "value": 10,
    "code": "WELCOME10"
  },
  "taxRate": 15
}
```

**Response**:
```json
{
  "success": true,
  "pricing": {
    "unitPrice": 50000,
    "quantity": 3,
    "subtotal": 150000,
    "discountAmount": 15000,
    "taxRate": 15,
    "taxAmount": 20250,
    "totalAmount": 155250
  }
}
```

---

### 2. Validate Discount Code

**Endpoint**: `POST /api/payments/validate-discount`

**Purpose**: Check if discount code is valid

**Request**:
```json
{
  "code": "WELCOME10",
  "bookingType": "property"
}
```

**Response**:
```json
{
  "success": true,
  "valid": true,
  "discount": {
    "type": "percentage",
    "value": 10,
    "code": "WELCOME10",
    "reason": "Welcome discount"
  },
  "message": "Discount code applied successfully"
}
```

**Available Discount Codes**:
- `WELCOME10` - 10% off (Welcome discount)
- `VANUATU20` - 20% off (Vanuatu special)
- `SUMMER2025` - 15% off (Summer promotion)
- `FIRSTBOOKING` - 5,000 VUV off (First booking bonus)
- `VIP50` - 50,000 VUV off (VIP customer discount)

---

### 3. Process Payment

**Endpoint**: `POST /api/payments/process`

**Purpose**: Record payment for a booking

**Request**:
```json
{
  "bookingId": "65b2c3d4e5f6g7h8",
  "amount": 155250,
  "paymentMethod": "card",
  "paymentDetails": {
    "cardLastFour": "4242",
    "cardBrand": "Visa"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment of 155250 VUV processed successfully. Booking fully paid.",
  "booking": {
    "_id": "65b2c3d4e5f6g7h8",
    "reservationNumber": "VU-202512-458923",
    "payment": {
      "status": "paid",
      "method": "card",
      "reference": "PAY-20251223-458923",
      "transactionId": "TXN-1703345678901-4567",
      "paidAmount": 155250,
      "remainingAmount": 0,
      "paidAt": "2025-12-23T14:30:00.000Z"
    }
  }
}
```

**Payment Methods**:
- **cash**: Cash payment
- **card**: Credit/Debit card
- **mobile**: Mobile money (e.g., M-PESA, Digicel Mobile Money)
- **transfer**: Bank transfer
- **paypal**: PayPal
- **stripe**: Stripe payment gateway

---

### 4. Partial Payment

**Request**:
```json
{
  "bookingId": "65b2c3d4e5f6g7h8",
  "amount": 50000,
  "paymentMethod": "cash"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment of 50000 VUV processed successfully. Remaining: 105250",
  "booking": {
    "payment": {
      "status": "partial",
      "paidAmount": 50000,
      "remainingAmount": 105250
    }
  }
}
```

---

### 5. Process Refund

**Endpoint**: `POST /api/payments/refund`

**Purpose**: Refund payment for a booking

**Request**:
```json
{
  "bookingId": "65b2c3d4e5f6g7h8",
  "refundAmount": 155250,
  "refundReason": "Customer cancellation - full refund"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Refund of 155250 VUV processed successfully. Fully refunded.",
  "refundAmount": 155250,
  "booking": {
    "status": "cancelled",
    "payment": {
      "status": "refunded",
      "paidAmount": 155250,
      "refundAmount": 155250,
      "refundedAt": "2025-12-23T15:00:00.000Z"
    }
  }
}
```

---

### 6. Get Payment Summary

**Endpoint**: `GET /api/payments/summary/:bookingId`

**Purpose**: Get complete payment summary for a booking

**Response**:
```json
{
  "success": true,
  "summary": {
    "bookingId": "65b2c3d4e5f6g7h8",
    "reservationNumber": "VU-202512-458923",
    "customer": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "pricing": {
      "unitPrice": 50000,
      "quantity": 3,
      "subtotal": 150000,
      "discount": {
        "type": "percentage",
        "value": 10,
        "code": "WELCOME10",
        "amount": 15000
      },
      "tax": {
        "rate": 15,
        "amount": 20250
      },
      "total": 155250,
      "currency": "VUV"
    },
    "payment": {
      "status": "paid",
      "method": "card",
      "reference": "PAY-20251223-458923",
      "transactionId": "TXN-1703345678901-4567",
      "paidAmount": 155250,
      "remainingAmount": 0,
      "refundAmount": 0,
      "paidAt": "2025-12-23T14:30:00.000Z"
    }
  }
}
```

---

### 7. Get Payment Status

**Endpoint**: `GET /api/payments/status/:bookingId`

**Purpose**: Quick check of payment status

**Response**:
```json
{
  "success": true,
  "status": "partial",
  "paidAmount": 50000,
  "remainingAmount": 105250,
  "totalAmount": 155250,
  "currency": "VUV"
}
```

---

### 8. Get Payment Report

**Endpoint**: `GET /api/payments/report`

**Purpose**: Generate payment report for date range

**Query Parameters**:
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `status`: Filter by payment status (optional)

**Example**:
```
GET /api/payments/report?startDate=2025-12-01&endDate=2025-12-31&status=paid
```

**Response**:
```json
{
  "success": true,
  "report": {
    "period": {
      "startDate": "2025-12-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.999Z"
    },
    "summary": {
      "totalBookings": 145,
      "totalRevenue": 18500000,
      "totalRefunded": 450000,
      "byPaymentMethod": {
        "card": 12500000,
        "cash": 3500000,
        "mobile": 2000000,
        "transfer": 500000
      },
      "byStatus": {
        "paid": 120,
        "partial": 15,
        "unpaid": 8,
        "refunded": 2
      }
    },
    "bookings": [...]
  }
}
```

---

### 9. Update Payment Status (Admin)

**Endpoint**: `PATCH /api/payments/:bookingId/update-status`

**Purpose**: Manually update payment status (admin only)

**Request**:
```json
{
  "status": "paid",
  "reference": "MANUAL-20251223-001"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment status updated",
  "booking": {...}
}
```

---

## Discount Types

### 1. Percentage Discount
- Applied as percentage of subtotal
- Value: 0-100
- Example: 10% off = value: 10

### 2. Fixed Discount
- Fixed amount off subtotal
- Value: Amount in currency
- Example: 5,000 VUV off = value: 5000

### 3. Coupon Code
- Predefined discount codes
- Can be percentage or fixed
- Example: WELCOME10, SUMMER2025

### 4. Seasonal Discount
- Time-based discounts
- Applied during specific periods
- Example: Christmas special, Summer sale

---

## Tax/VAT Configuration

### Vanuatu Tax Rate: 15%

Tax is calculated on the **discounted amount** (after subtracting discount from subtotal).

**Formula**: `Tax = (Subtotal - Discount) × Tax Rate`

### Custom Tax Rates:
Different tax rates can be applied based on:
- Booking type (properties, services, flights)
- Location
- Customer type (business vs personal)

---

## Payment Flow Examples

### Example 1: Full Payment

```javascript
// 1. Create booking with pricing
const booking = await createBooking({
  unitPrice: 50000,
  quantity: 3,
  discountCode: "WELCOME10"
});

// Result:
// - Subtotal: 150,000 VUV
// - Discount: 15,000 VUV
// - Tax: 20,250 VUV
// - Total: 155,250 VUV
// - Payment Status: unpaid

// 2. Process full payment
const payment = await processPayment({
  bookingId: booking._id,
  amount: 155250,
  paymentMethod: "card"
});

// Result:
// - Payment Status: paid
// - Paid Amount: 155,250 VUV
// - Remaining: 0 VUV
// - Booking Status: confirmed
```

---

### Example 2: Partial Payment

```javascript
// 1. Create booking (total: 155,250 VUV)
const booking = await createBooking({...});

// 2. Process deposit (50% down)
await processPayment({
  bookingId: booking._id,
  amount: 77625,
  paymentMethod: "transfer"
});

// Result:
// - Payment Status: partial
// - Paid: 77,625 VUV
// - Remaining: 77,625 VUV

// 3. Process final payment
await processPayment({
  bookingId: booking._id,
  amount: 77625,
  paymentMethod: "cash"
});

// Result:
// - Payment Status: paid
// - Paid: 155,250 VUV
// - Remaining: 0 VUV
```

---

### Example 3: Refund

```javascript
// 1. Customer wants refund
await processRefund({
  bookingId: booking._id,
  refundAmount: 155250,
  refundReason: "Customer cancellation"
});

// Result:
// - Payment Status: refunded
// - Refund Amount: 155,250 VUV
// - Booking Status: cancelled
```

---

## Payment Reference Numbers

### Format: `PAY-YYYYMMDD-XXXXXX`

**Example**: `PAY-20251223-458923`
- PAY: Prefix
- 20251223: Date (Dec 23, 2025)
- 458923: Random 6-digit number

### Transaction ID Format: `TXN-TIMESTAMP-XXXX`

**Example**: `TXN-1703345678901-4567`
- TXN: Prefix
- 1703345678901: Unix timestamp
- 4567: Random 4-digit number

---

## Integration with Booking Flow

### Creating Booking with Payment:

```javascript
POST /api/bookings/property
{
  "propertyId": "...",
  "roomType": "Deluxe Suite",
  "checkInDate": "2025-12-25",
  "checkOutDate": "2025-12-28",
  "guestCount": { "adults": 2, "children": 0 },
  "guestDetails": {...},
  "discountCode": "WELCOME10",
  "currency": "VUV"
}
```

**Auto-calculated**:
- Unit Price: Room price per night
- Quantity: Number of nights
- Subtotal: Price × Nights
- Discount: Applied from code
- Tax: 15% of discounted amount
- Total: Final amount
- Payment Status: unpaid
- Remaining Amount: Total amount

---

## Frontend Integration

### Display Pricing Breakdown:

```jsx
<div className="pricing-breakdown">
  <div className="line-item">
    <span>{nights} nights × {unitPrice} VUV</span>
    <span>{subtotal} VUV</span>
  </div>
  
  {discount && (
    <div className="line-item discount">
      <span>Discount ({discount.code})</span>
      <span>-{discountAmount} VUV</span>
    </div>
  )}
  
  <div className="line-item">
    <span>Tax ({taxRate}%)</span>
    <span>{taxAmount} VUV</span>
  </div>
  
  <div className="line-item total">
    <span><strong>Total</strong></span>
    <span><strong>{totalAmount} VUV</strong></span>
  </div>
</div>
```

### Payment Status Badge:

```jsx
const getStatusColor = (status) => {
  switch(status) {
    case 'paid': return 'bg-green-500';
    case 'partial': return 'bg-yellow-500';
    case 'unpaid': return 'bg-red-500';
    case 'refunded': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

<span className={`badge ${getStatusColor(payment.status)}`}>
  {payment.status.toUpperCase()}
</span>
```

---

## Best Practices

### 1. Always Calculate on Server
- Never trust client-side calculations
- Server validates all pricing
- Prevents price manipulation

### 2. Validate Payment Amounts
- Check against remaining balance
- Prevent overpayment
- Validate positive amounts only

### 3. Generate Unique References
- Use timestamp-based generation
- Include random component
- Ensure uniqueness

### 4. Track Payment History
- Keep audit trail of all transactions
- Record who processed payment
- Store payment method details

### 5. Handle Partial Payments
- Allow installment payments
- Track remaining balance
- Update status appropriately

### 6. Secure Payment Details
- Never store full card numbers
- Only keep last 4 digits
- Use payment gateway tokens

---

## Error Handling

### Common Errors:

**1. Invalid Amount**:
```json
{
  "success": false,
  "message": "Invalid payment amount",
  "error": "INVALID_AMOUNT"
}
```

**2. Amount Exceeds Balance**:
```json
{
  "success": false,
  "message": "Payment amount exceeds remaining balance. Remaining: 50000 VUV",
  "error": "AMOUNT_EXCEEDS_BALANCE"
}
```

**3. Already Paid**:
```json
{
  "success": false,
  "message": "Booking is already fully paid",
  "error": "ALREADY_PAID"
}
```

**4. Invalid Discount Code**:
```json
{
  "valid": false,
  "message": "Invalid discount code"
}
```

---

## Testing

### Test Payment Processing:

```bash
# 1. Create booking
curl -X POST http://localhost:5000/api/bookings/property \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "PROP_ID",
    "roomType": "Deluxe",
    "checkInDate": "2025-12-25",
    "checkOutDate": "2025-12-28",
    "guestDetails": {...},
    "discountCode": "WELCOME10"
  }'

# 2. Process payment
curl -X POST http://localhost:5000/api/payments/process \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_ID",
    "amount": 155250,
    "paymentMethod": "card",
    "paymentDetails": {
      "cardLastFour": "4242",
      "cardBrand": "Visa"
    }
  }'

# 3. Check payment status
curl -X GET http://localhost:5000/api/payments/status/BOOKING_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## Benefits

✅ **Transparent Pricing**: Complete breakdown visible to customers
✅ **Flexible Discounts**: Multiple discount types supported
✅ **Tax Compliance**: Automatic tax calculation
✅ **Partial Payments**: Support installment payments
✅ **Full Audit Trail**: Track all payment transactions
✅ **Refund Management**: Easy refund processing
✅ **Multiple Payment Methods**: Cash, card, mobile, transfers
✅ **Real-time Status**: Always know payment state
✅ **Reporting Ready**: Financial reports and analytics

---

## Next Steps

- [ ] Integrate payment gateway (Stripe/PayPal)
- [ ] Add payment receipt generation (PDF)
- [ ] Implement payment reminders
- [ ] Create admin payment dashboard
- [ ] Add bulk payment processing
- [ ] Implement automated refunds
- [ ] Add payment analytics charts
- [ ] Create invoicing system
