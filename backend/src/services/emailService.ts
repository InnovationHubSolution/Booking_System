import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: {
        filename: string;
        content: Buffer | string;
    }[];
}

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Configure email transporter (using Gmail as example)
        this.transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            await this.transporter.sendMail({
                from: `"Vanuatu Booking System" <${process.env.EMAIL_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                attachments: options.attachments
            });
            console.log(`Email sent successfully to ${options.to}`);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }

    async sendBookingConfirmation(to: string, bookingDetails: any): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f8f9fa; padding: 20px; margin-top: 20px; }
                    .booking-details { background-color: white; padding: 15px; margin-top: 15px; border-radius: 5px; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
                    .label { font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6c757d; font-size: 12px; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Booking Confirmed!</h1>
                    </div>
                    <div class="content">
                        <h2>Thank you for your booking, ${bookingDetails.customerName}!</h2>
                        <p>Your reservation has been confirmed. Here are your booking details:</p>
                        
                        <div class="booking-details">
                            <div class="detail-row">
                                <span class="label">Reservation Number:</span>
                                <span>${bookingDetails.reservationNumber}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Booking Type:</span>
                                <span>${bookingDetails.bookingType}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Check-in / Start Date:</span>
                                <span>${new Date(bookingDetails.startDate).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Check-out / End Date:</span>
                                <span>${new Date(bookingDetails.endDate).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Total Amount:</span>
                                <span>${bookingDetails.currency} ${bookingDetails.totalAmount}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Payment Status:</span>
                                <span>${bookingDetails.paymentStatus}</span>
                            </div>
                        </div>

                        ${bookingDetails.propertyName ? `
                        <div class="booking-details">
                            <h3>Property Details</h3>
                            <p><strong>${bookingDetails.propertyName}</strong></p>
                            <p>${bookingDetails.propertyAddress}</p>
                            <p>Check-in Time: ${bookingDetails.checkInTime}</p>
                            <p>Check-out Time: ${bookingDetails.checkOutTime}</p>
                        </div>
                        ` : ''}

                        <center>
                            <a href="${process.env.FRONTEND_URL}/bookings/${bookingDetails.bookingId}" class="button">View Booking Details</a>
                        </center>

                        <p style="margin-top: 30px;">
                            <strong>Cancellation Policy:</strong><br>
                            ${bookingDetails.cancellationPolicy || 'Please review the cancellation policy in your booking details.'}
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>If you have any questions, please contact us at support@vanuatubooking.com</p>
                        <p>&copy; 2025 Vanuatu Booking System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to,
            subject: `Booking Confirmation - ${bookingDetails.reservationNumber}`,
            html
        });
    }

    async sendBookingCancellation(to: string, bookingDetails: any): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f8f9fa; padding: 20px; margin-top: 20px; }
                    .booking-details { background-color: white; padding: 15px; margin-top: 15px; border-radius: 5px; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
                    .label { font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6c757d; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Booking Cancelled</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${bookingDetails.customerName},</h2>
                        <p>Your booking has been cancelled as requested.</p>
                        
                        <div class="booking-details">
                            <div class="detail-row">
                                <span class="label">Reservation Number:</span>
                                <span>${bookingDetails.reservationNumber}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Cancellation Date:</span>
                                <span>${new Date().toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Refund Amount:</span>
                                <span>${bookingDetails.currency} ${bookingDetails.refundAmount || 0}</span>
                            </div>
                        </div>

                        <p>The refund will be processed within 5-7 business days to your original payment method.</p>
                        
                        <p>We're sorry to see you go. If you have any feedback about your experience, we'd love to hear from you.</p>
                    </div>
                    
                    <div class="footer">
                        <p>If you have any questions, please contact us at support@vanuatubooking.com</p>
                        <p>&copy; 2025 Vanuatu Booking System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to,
            subject: `Booking Cancellation - ${bookingDetails.reservationNumber}`,
            html
        });
    }

    async sendPaymentReceipt(to: string, paymentDetails: any): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f8f9fa; padding: 20px; margin-top: 20px; }
                    .receipt { background-color: white; padding: 15px; margin-top: 15px; border-radius: 5px; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
                    .total-row { display: flex; justify-content: space-between; padding: 15px 0; font-size: 18px; font-weight: bold; background-color: #f8f9fa; margin-top: 10px; }
                    .label { font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6c757d; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Payment Receipt</h1>
                    </div>
                    <div class="content">
                        <h2>Payment Successful!</h2>
                        <p>Thank you for your payment. Your transaction has been completed successfully.</p>
                        
                        <div class="receipt">
                            <div class="detail-row">
                                <span class="label">Transaction ID:</span>
                                <span>${paymentDetails.transactionId}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Date:</span>
                                <span>${new Date().toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Payment Method:</span>
                                <span>${paymentDetails.paymentMethod}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Reservation Number:</span>
                                <span>${paymentDetails.reservationNumber}</span>
                            </div>
                            <hr>
                            <div class="detail-row">
                                <span class="label">Subtotal:</span>
                                <span>${paymentDetails.currency} ${paymentDetails.subtotal}</span>
                            </div>
                            ${paymentDetails.discount > 0 ? `
                            <div class="detail-row">
                                <span class="label">Discount:</span>
                                <span>-${paymentDetails.currency} ${paymentDetails.discount}</span>
                            </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="label">Tax:</span>
                                <span>${paymentDetails.currency} ${paymentDetails.tax}</span>
                            </div>
                            <div class="total-row">
                                <span>Total Paid:</span>
                                <span>${paymentDetails.currency} ${paymentDetails.total}</span>
                            </div>
                        </div>

                        <p style="margin-top: 20px;">This receipt has been sent to your email for your records.</p>
                    </div>
                    
                    <div class="footer">
                        <p>If you have any questions about this payment, please contact us at support@vanuatubooking.com</p>
                        <p>&copy; 2025 Vanuatu Booking System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to,
            subject: `Payment Receipt - ${paymentDetails.transactionId}`,
            html
        });
    }

    async sendPasswordReset(to: string, resetToken: string): Promise<boolean> {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f8f9fa; padding: 20px; margin-top: 20px; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6c757d; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>You requested to reset your password for your Vanuatu Booking System account.</p>
                        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
                        
                        <center>
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </center>

                        <p style="margin-top: 30px;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
                        
                        <p style="font-size: 12px; color: #6c757d;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            ${resetUrl}
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>&copy; 2025 Vanuatu Booking System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to,
            subject: 'Password Reset Request - Vanuatu Booking System',
            html
        });
    }

    async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f8f9fa; padding: 20px; margin-top: 20px; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6c757d; font-size: 12px; }
                    .features { background-color: white; padding: 15px; margin-top: 15px; border-radius: 5px; }
                    .feature-item { padding: 10px 0; border-bottom: 1px solid #e9ecef; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Vanuatu Booking System!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${userName}!</h2>
                        <p>Thank you for joining Vanuatu Booking System. We're excited to help you discover and book amazing experiences in Vanuatu!</p>
                        
                        <div class="features">
                            <h3>What you can do:</h3>
                            <div class="feature-item">✈️ Book flights to and within Vanuatu</div>
                            <div class="feature-item">🏨 Find and reserve accommodations</div>
                            <div class="feature-item">🚗 Rent vehicles for your journey</div>
                            <div class="feature-item">🎟️ Book tours and activities</div>
                            <div class="feature-item">💰 Get exclusive deals and promotions</div>
                            <div class="feature-item">⭐ Earn loyalty points with every booking</div>
                        </div>

                        <center>
                            <a href="${process.env.FRONTEND_URL}" class="button">Start Exploring</a>
                        </center>

                        <p style="margin-top: 30px;">
                            <strong>Need help?</strong><br>
                            Visit our help center or contact our support team at support@vanuatubooking.com
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>&copy; 2025 Vanuatu Booking System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to,
            subject: 'Welcome to Vanuatu Booking System!',
            html
        });
    }
}

export default new EmailService();
