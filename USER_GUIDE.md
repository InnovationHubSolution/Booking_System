# Vanuatu Booking System - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [User Registration & Login](#user-registration--login)
3. [Browsing Services](#browsing-services)
4. [Making Bookings](#making-bookings)
5. [Managing Your Bookings](#managing-your-bookings)
6. [Payment Methods](#payment-methods)
7. [Wishlist Feature](#wishlist-feature)
8. [User Roles](#user-roles)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Email address for registration

### Accessing the System
1. Open your web browser
2. Navigate to: `http://localhost:3000` (for local development)
3. You'll see the homepage with available services

---

## User Registration & Login

### Creating a New Account

1. **Navigate to Registration**
   - Click the "Register" button in the navigation bar
   - Or go directly to: `http://localhost:3000/register`

2. **Fill in Your Details**
   - **First Name**: Your first name (required)
   - **Last Name**: Your last name (required)
   - **Email**: Valid email address (required)
   - **Phone**: Contact number (optional, format: +678...)
   - **Password**: Minimum 6 characters (required)

3. **Submit Registration**
   - Click the "Register" button
   - You'll be automatically logged in and redirected to the services page

### Logging In

1. Click "Login" in the navigation bar
2. Enter your email and password
3. Click "Login" button
4. You'll be redirected to your personalized dashboard

### Forgot Password
- Contact system administrator for password reset
- Future feature: Self-service password reset via email

---

## Browsing Services

The Vanuatu Booking System offers five main service categories:

### 1. **Accommodations**
Browse and book hotels, resorts, and vacation rentals across Vanuatu.

**Features:**
- View property details, photos, and amenities
- Check availability by date
- Read reviews from other guests
- Filter by price, location, and ratings
- See property location on map

### 2. **Flights**
Search and book domestic and international flights.

**Features:**
- One-way and round-trip options
- Search by departure/arrival cities and dates
- View flight details (duration, layovers, baggage)
- Compare prices across different airlines
- Filter by airline, departure time, and stops

### 3. **Car Rentals**
Rent vehicles for your Vanuatu adventure.

**Features:**
- Choose from sedans, SUVs, 4x4s, and luxury vehicles
- View vehicle specifications (seats, luggage capacity)
- Daily, weekly, and monthly rates
- Airport and city pickup locations
- Insurance options available

### 4. **Transfers**
Book airport transfers and city transportation.

**Features:**
- Airport to hotel transfers
- City tours with transfers
- Private or shared options
- Meet & greet service
- Child seats available

### 5. **Travel Packages**
All-inclusive vacation packages.

**Features:**
- Pre-designed itineraries
- Accommodation + tours + meals included
- Various themes: adventure, cultural, honeymoon, family
- Multi-day experiences
- Professional guides included

---

## Making Bookings

### Step-by-Step Booking Process

#### 1. **Search for Services**
- Select your service category (accommodation, flight, etc.)
- Enter your search criteria:
  - Dates
  - Location/destination
  - Number of guests
  - Any specific requirements

#### 2. **Browse Results**
- Review available options
- Click on any service to see full details
- Compare prices and features
- Read customer reviews

#### 3. **Select Your Service**
- Click "Book Now" on your chosen service
- You'll be taken to the booking details page

#### 4. **Fill in Booking Details**

**Basic Information:**
- Confirm dates and times
- Number of guests/passengers
- Special requests or requirements

**Guest Information:**
- Primary contact details
- Guest names (for flights)
- Age of children (if applicable)

**Additional Services:**
- Add-ons (meals, equipment, insurance)
- Upgrades (room category, seat class)

#### 5. **Review Booking**
- Check all details carefully
- Review total price breakdown:
  - Base price
  - Taxes and fees
  - Additional services
  - Total amount

#### 6. **Payment**
- Choose payment method:
  - Credit/Debit Card
  - PayPal
  - Bank Transfer
  - Cash (for some services)
- Enter payment details securely
- Confirm payment

#### 7. **Confirmation**
- Receive booking confirmation number
- Email confirmation sent to your registered email
- Save confirmation for your records

---

## Managing Your Bookings

### Viewing Your Bookings

1. Click "My Bookings" in the navigation menu
2. See all your bookings organized by:
   - **Upcoming**: Future bookings
   - **Active**: Current/ongoing bookings
   - **Past**: Completed bookings
   - **Cancelled**: Cancelled bookings

### Booking Details

Click on any booking to view:
- Complete booking information
- Confirmation number
- Service provider details
- Check-in/check-out dates
- Payment status
- Cancellation policy
- QR code/barcode (where applicable)

### Modifying Bookings

**Date Changes:**
- Click "Modify" on your booking
- Select new dates (subject to availability)
- Pay any price difference
- Receive updated confirmation

**Cancellations:**
- Click "Cancel" on your booking
- Review cancellation policy
- Confirm cancellation
- Refund processed according to policy

### Booking Status

- **Pending**: Awaiting confirmation
- **Confirmed**: Booking confirmed
- **Paid**: Payment completed
- **Active**: Currently in progress
- **Completed**: Service finished
- **Cancelled**: Booking cancelled
- **Refunded**: Refund processed

---

## Payment Methods

### Accepted Payment Options

1. **Credit/Debit Cards**
   - Visa, Mastercard, American Express
   - Secure payment processing
   - Instant confirmation

2. **Digital Wallets**
   - PayPal
   - Apple Pay (if available)
   - Google Pay (if available)

3. **Bank Transfer**
   - Direct bank deposit
   - Confirmation within 1-2 business days
   - Reference number required

4. **Cash Payment**
   - Available for select services
   - Pay at pickup/check-in
   - Receipt provided

### Payment Security
- All transactions are encrypted
- PCI DSS compliant
- Your payment details are never stored
- Secure checkout process

### Refund Policy

**Cancellation Timeline:**
- **7+ days before**: 100% refund (minus processing fee)
- **3-7 days before**: 50% refund
- **Less than 3 days**: No refund (unless otherwise stated)
- **No-show**: No refund

*Note: Refund policies vary by service provider. Always check specific terms.*

---

## Wishlist Feature

### Adding to Wishlist

1. Browse any service
2. Click the ❤️ (heart) icon
3. Service saved to your wishlist

### Managing Wishlist

- Access via "Wishlist" in navigation menu
- View all saved services
- Remove items by clicking ❤️ again
- Quick book from wishlist

### Sharing Wishlist
- Share your wishlist with friends/family
- Get travel planning suggestions
- Collaborate on trip planning

---

## User Roles

### Customer (Standard User)

**Capabilities:**
- Browse all services
- Make bookings
- Manage own bookings
- Leave reviews
- Create wishlist
- View booking history

### Host

**Additional Capabilities:**
- List properties for rent
- Manage property availability
- Set pricing and policies
- View booking requests
- Communicate with guests
- Access host dashboard
- View earnings and analytics

**To Become a Host:**
1. Go to your profile
2. Click "Become a Host"
3. Complete host verification
4. Add your first property
5. Start accepting bookings

### Admin

**Full System Access:**
- Manage all users
- Approve/reject listings
- Handle disputes
- Access all bookings
- View system analytics
- Manage content
- Configure system settings

---

## Troubleshooting

### Common Issues & Solutions

#### Cannot Register Account

**Problem:** Registration fails or shows error

**Solutions:**
1. Ensure all required fields are filled
2. Check email format is valid
3. Password must be at least 6 characters
4. Email must not already be registered
5. Clear browser cache and try again
6. Try a different browser

#### Cannot Login

**Problem:** Login credentials not working

**Solutions:**
1. Verify email and password are correct
2. Check Caps Lock is off
3. Try password reset
4. Clear browser cookies
5. Ensure backend server is running

#### Booking Not Confirmed

**Problem:** Booking stuck in pending status

**Solutions:**
1. Check your email for confirmation
2. Verify payment was successful
3. Check spam/junk folder
4. Contact support with booking reference
5. Wait 5-10 minutes for processing

#### Payment Failed

**Problem:** Payment transaction declined

**Solutions:**
1. Check card details are correct
2. Ensure sufficient funds available
3. Verify billing address matches card
4. Try different payment method
5. Contact your bank
6. Use different card

#### Cannot View Bookings

**Problem:** My Bookings page is empty

**Solutions:**
1. Ensure you're logged in
2. Check you have made bookings
3. Refresh the page
4. Clear browser cache
5. Check internet connection

#### Search Not Working

**Problem:** No results when searching

**Solutions:**
1. Try different search criteria
2. Expand date range
3. Check location spelling
4. Remove filters
5. Refresh the page

---

## Support & Contact

### Getting Help

**Technical Issues:**
- Check this user guide first
- Review FAQ section
- Contact technical support

**Booking Issues:**
- Contact service provider directly
- Use booking reference number
- Include dates and details

**Payment Issues:**
- Contact billing department
- Have transaction ID ready
- Check refund policy

### Contact Information

**Email Support:** support@vanuatubooking.com
**Phone:** +678 [phone number]
**Hours:** Monday-Friday, 8:00 AM - 6:00 PM (Vanuatu Time)
**Emergency:** 24/7 support for urgent booking issues

---

## Tips for Best Experience

### Booking Tips

1. **Book Early**
   - Better prices for advance bookings
   - More options available
   - Popular dates fill quickly

2. **Read Reviews**
   - Check recent guest reviews
   - Look at overall ratings
   - Consider response rate of hosts

3. **Check Policies**
   - Understand cancellation terms
   - Review refund policy
   - Note check-in/check-out times

4. **Save Confirmations**
   - Keep booking references safe
   - Take screenshots
   - Print confirmations for travel

5. **Contact Hosts**
   - Ask questions before booking
   - Confirm special requests
   - Get local recommendations

### Safety Tips

1. **Secure Your Account**
   - Use strong, unique password
   - Don't share login details
   - Log out on shared devices

2. **Verify Properties**
   - Check recent reviews
   - Look for verified badges
   - Research location

3. **Payment Safety**
   - Only pay through the platform
   - Never wire money directly
   - Keep transaction records

4. **Personal Information**
   - Don't share sensitive details
   - Use platform messaging
   - Report suspicious activity

---

## Frequently Asked Questions (FAQ)

### General

**Q: Is the system free to use?**
A: Yes, browsing and registration are free. You only pay for services you book.

**Q: Can I book without registering?**
A: No, you must create an account to make bookings.

**Q: How do I change my email address?**
A: Go to Profile Settings > Edit Profile > Update email.

### Bookings

**Q: Can I modify my booking after confirmation?**
A: Yes, subject to availability and modification policies. Some changes may incur fees.

**Q: What happens if I arrive late?**
A: Contact the service provider immediately. Late arrival policies vary.

**Q: Can I cancel for free?**
A: Depends on the cancellation policy and timing. Check your booking details.

**Q: Do I need to print my booking confirmation?**
A: Digital confirmations are accepted, but printing is recommended as backup.

### Payments

**Q: When is payment charged?**
A: At time of booking for most services. Some allow pay-at-property.

**Q: Are prices in VUV (Vanuatu Vatu)?**
A: Yes, all prices are in VUV unless otherwise stated.

**Q: How long do refunds take?**
A: 5-10 business days for card payments, up to 15 days for bank transfers.

**Q: Do prices include taxes?**
A: Final prices include all taxes and fees unless specified as extra.

### Technical

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, Edge (latest versions).

**Q: Is there a mobile app?**
A: Currently web-based only. Mobile app coming soon.

**Q: Can I use the system offline?**
A: No, internet connection required for booking and browsing.

---

## Privacy & Security

### Your Data

- We protect your personal information
- Data encrypted during transmission
- Secure payment processing
- GDPR compliant (where applicable)
- Privacy policy available on website

### What We Collect

- Account information (name, email, phone)
- Booking details
- Payment information (securely stored)
- Usage data for improvement
- Reviews and feedback

### Your Rights

- Access your data
- Request data deletion
- Update information
- Opt-out of marketing emails
- Download your data

---

## Getting Started Checklist

- [ ] Create your account
- [ ] Verify email address
- [ ] Complete your profile
- [ ] Browse available services
- [ ] Add favorite services to wishlist
- [ ] Make your first booking
- [ ] Save payment method (optional)
- [ ] Download confirmation
- [ ] Enable notifications (optional)
- [ ] Leave a review after your trip

---

## Version History

**Version 1.0** - December 2025
- Initial user guide release
- Core features documentation
- Basic troubleshooting guide

---

## Need More Help?

If you can't find the answer in this guide:

1. Visit our Help Center
2. Contact customer support
3. Check video tutorials
4. Join community forum
5. Email technical support

**Happy Booking! Enjoy your Vanuatu experience! 🌴**
