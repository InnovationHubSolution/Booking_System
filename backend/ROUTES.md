# API Routes Documentation

## Complete Route Configuration

All routes are properly configured and wired in the Vanuatu Booking System.

### Authentication & Authorization Routes
**Base URL:** `/api/auth`
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Refresh JWT token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `GET /verify-email/:token` - Verify email address

### User Management Routes
**Base URL:** `/api/users`
- `GET /profile` - Get user profile (authenticated)
- `PUT /profile` - Update user profile (authenticated)
- `PUT /password` - Change password (authenticated)
- `GET /bookings` - Get user booking history (authenticated)
- `GET /stats` - Get user statistics (authenticated)
- `POST /preferences` - Update user preferences (authenticated)
- `DELETE /account` - Delete/deactivate account (authenticated)

### Booking Routes
**Base URL:** `/api/bookings`
- `GET /` - Get all bookings (admin) or user bookings (user)
- `POST /` - Create new booking (authenticated)
- `GET /:id` - Get booking by ID (authenticated)
- `PUT /:id` - Update booking (authenticated)
- `DELETE /:id` - Cancel booking (authenticated)
- `GET /status/:status` - Get bookings by status
- `POST /:id/confirm` - Confirm booking (admin)
- `POST /:id/complete` - Complete booking (admin)

### Property Routes
**Base URL:** `/api/properties`
- `GET /` - Search and list properties
- `GET /:id` - Get property details
- `POST /` - Create property (admin)
- `PUT /:id` - Update property (admin)
- `DELETE /:id` - Delete property (admin)
- `GET /featured` - Get featured properties
- `GET /nearby` - Get properties near location
- `POST /:id/availability` - Check property availability

### Flight Routes
**Base URL:** `/api/flights`
- `GET /search` - Search flights
- `GET /:id` - Get flight details
- `POST /` - Create flight (admin)
- `PUT /:id` - Update flight (admin)
- `DELETE /:id` - Delete flight (admin)
- `GET /airlines` - Get all airlines
- `GET /routes` - Get available routes

### Car Rental Routes
**Base URL:** `/api/car-rentals`
- `GET /` - Search car rentals
- `GET /:id` - Get car rental details
- `POST /` - Create car rental (admin)
- `PUT /:id` - Update car rental (admin)
- `DELETE /:id` - Delete car rental (admin)
- `GET /companies` - Get all rental companies
- `POST /availability` - Check car availability

### Transfer Routes
**Base URL:** `/api/transfers`
- `GET /` - Search transfers
- `GET /:id` - Get transfer details
- `POST /` - Create transfer (admin)
- `PUT /:id` - Update transfer (admin)
- `DELETE /:id` - Delete transfer (admin)
- `GET /routes` - Get transfer routes
- `POST /quote` - Get transfer quote

### Package Routes
**Base URL:** `/api/packages`
- `GET /` - Search travel packages
- `GET /:id` - Get package details
- `POST /` - Create package (admin)
- `PUT /:id` - Update package (admin)
- `DELETE /:id` - Delete package (admin)
- `GET /featured` - Get featured packages
- `GET /category/:category` - Get packages by category

### Scenic Tours Routes
**Base URL:** `/api/scenic-tours`
- `GET /` - Search scenic tours
- `GET /:id` - Get tour details
- `POST /` - Create tour (admin)
- `PUT /:id` - Update tour (admin)
- `DELETE /:id` - Delete tour (admin)
- `GET /popular` - Get popular tours
- `POST /:id/book` - Book a tour

### Service Routes
**Base URL:** `/api/services`
- `GET /` - Get all services
- `GET /:id` - Get service details
- `POST /` - Create service (admin)
- `PUT /:id` - Update service (admin)
- `DELETE /:id` - Delete service (admin)
- `GET /category/:category` - Get services by category

### Payment Routes
**Base URL:** `/api/payments`
- `POST /process` - Process payment (authenticated)
- `POST /refund` - Process refund (admin)
- `GET /methods` - Get available payment methods
- `POST /verify` - Verify payment status
- `GET /history` - Get payment history (authenticated)
- `GET /:id` - Get payment details (authenticated)

### Discount Routes
**Base URL:** `/api/discounts`
- `GET /` - Get all active discounts
- `GET /validate/:code` - Validate discount code (authenticated)
- `POST /` - Create discount (admin)
- `PUT /:id` - Update discount (admin)
- `DELETE /:id` - Delete discount (admin)
- `GET /usage/my` - Get user's discount usage (authenticated)
- `GET /stats` - Get discount statistics (admin)

### Review Routes
**Base URL:** `/api/reviews`
- `GET /` - Get all reviews
- `GET /property/:propertyId` - Get reviews for property
- `GET /service/:serviceId` - Get reviews for service
- `POST /` - Create review (authenticated)
- `PUT /:id` - Update review (authenticated)
- `DELETE /:id` - Delete review (authenticated/admin)
- `POST /:id/helpful` - Mark review as helpful

### Wishlist Routes
**Base URL:** `/api/wishlist`
- `GET /` - Get user's wishlist (authenticated)
- `POST /` - Add to wishlist (authenticated)
- `DELETE /:itemId` - Remove from wishlist (authenticated)
- `DELETE /clear` - Clear wishlist (authenticated)

### Notification Routes
**Base URL:** `/api/notifications`
- `GET /` - Get user notifications (authenticated)
- `PUT /:id/read` - Mark notification as read (authenticated)
- `PUT /read-all` - Mark all as read (authenticated)
- `DELETE /:id` - Delete notification (authenticated)
- `DELETE /` - Delete all notifications (authenticated)

### Analytics Routes
**Base URL:** `/api/analytics`
- `GET /dashboard` - Get dashboard stats (admin)
- `GET /bookings` - Get booking analytics (admin)
- `GET /revenue` - Get revenue analytics (admin)
- `GET /users` - Get user analytics (admin)
- `GET /popular` - Get popular items analytics (admin)

### Promotion Routes
**Base URL:** `/api/promotions`
- `GET /` - Get all promotions
- `GET /active` - Get active promotions
- `GET /:id` - Get promotion details
- `POST /` - Create promotion (admin)
- `PUT /:id` - Update promotion (admin)
- `DELETE /:id` - Delete promotion (admin)

### Resource Routes
**Base URL:** `/api/resources`
- `GET /` - Get all resources
- `GET /:id` - Get resource details
- `POST /` - Create resource (admin)
- `PUT /:id` - Update resource (admin)
- `DELETE /:id` - Delete resource (admin)
- `GET /category/:category` - Get resources by category

### Advanced Routes
**Base URL:** `/api/advanced`
- Various advanced query and filtering endpoints
- Bulk operations
- Advanced search capabilities

### Audit Routes
**Base URL:** `/api/audit`
- `GET /logs` - Get audit logs (admin)
- `GET /logs/:id` - Get specific audit log (admin)
- `GET /user/:userId` - Get user audit trail (admin)
- `GET /resource/:resourceType/:resourceId` - Get resource audit trail (admin)

### Backup Routes
**Base URL:** `/api/backup`
- `GET /cars/:carId` - Get backup car options
- `POST /payment-methods` - Get backup payment methods
- Emergency fallback endpoints

### System Routes
- `GET /health` - Health check endpoint
- `GET /api` - API documentation and endpoint listing
- `GET /api-docs` - Swagger API documentation

## Rate Limiting

Routes are protected with the following rate limiters:
- **API Limiter:** 100 requests per 15 minutes (general)
- **Auth Limiter:** 5 requests per 15 minutes (authentication routes)
- **Search Limiter:** 50 requests per 15 minutes (search-heavy routes)
- **Booking Limiter:** 10 requests per 15 minutes (booking operations)

## Authentication

Most routes require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Admin Routes

Routes marked with (admin) require admin role for access.

## Security Features

All routes are protected with:
- CORS configuration
- XSS protection
- HPP (HTTP Parameter Pollution) protection
- Request size validation
- Content-type validation
- Security headers
- Data sanitization

## Error Handling

All routes return standardized error responses:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Success Response Format

Successful responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

## WebSocket Support

Real-time features are available through Socket.io for:
- Live booking updates
- Real-time notifications
- Chat support
- Live availability updates
