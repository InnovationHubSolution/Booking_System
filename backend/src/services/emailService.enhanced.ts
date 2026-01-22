import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { logInfo, logError } from '../config/logger';

// Email configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify connection (only in production)
if (process.env.NODE_ENV === 'production') {
    transporter.verify((error, success) => {
        if (error) {
            logError('Email service connection failed', error);
        } else {
            logInfo('Email service ready');
        }
    });
} else {
    logInfo('Email service initialized (development mode - verification skipped)');
}

// Load and compile email templates
const loadTemplate = (templateName: string): handlebars.TemplateDelegate => {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateSource);
};

// Generic email sender
export const sendEmail = async (options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    template?: string;
    context?: any;
}) => {
    try {
        let html = options.html;

        // If template is provided, compile it
        if (options.template && options.context) {
            const template = loadTemplate(options.template);
            html = template(options.context);
        }

        const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: html,
        };

        const info = await transporter.sendMail(mailOptions);
        logInfo(`Email sent to ${options.to}`, { messageId: info.messageId });
        return info;
    } catch (error) {
        logError('Failed to send email', error, { to: options.to });
        throw error;
    }
};

// Booking confirmation email
export const sendBookingConfirmation = async (booking: any, user: any) => {
    try {
        await sendEmail({
            to: user.email,
            subject: `Booking Confirmation - ${booking.reservationNumber}`,
            template: 'booking-confirmation',
            context: {
                userName: `${user.firstName} ${user.lastName}`,
                reservationNumber: booking.reservationNumber,
                bookingType: booking.bookingType,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                totalAmount: booking.pricing.totalAmount,
                currency: booking.pricing.currency,
                frontendUrl: process.env.FRONTEND_URL,
                bookingUrl: `${process.env.FRONTEND_URL}/booking/${booking._id}`,
                year: new Date().getFullYear()
            }
        });
        logInfo('Booking confirmation email sent', { bookingId: booking._id });
    } catch (error) {
        logError('Failed to send booking confirmation email', error);
    }
};

// Booking cancellation email
export const sendBookingCancellation = async (booking: any, user: any) => {
    try {
        await sendEmail({
            to: user.email,
            subject: `Booking Cancellation - ${booking.reservationNumber}`,
            template: 'booking-cancellation',
            context: {
                userName: `${user.firstName} ${user.lastName}`,
                reservationNumber: booking.reservationNumber,
                bookingType: booking.bookingType,
                refundAmount: booking.payment.refundAmount,
                currency: booking.pricing.currency,
                frontendUrl: process.env.FRONTEND_URL,
                year: new Date().getFullYear()
            }
        });
    } catch (error) {
        logError('Failed to send cancellation email', error);
    }
};

// Payment confirmation email
export const sendPaymentConfirmation = async (booking: any, user: any) => {
    try {
        await sendEmail({
            to: user.email,
            subject: `Payment Confirmation - ${booking.payment.reference}`,
            template: 'payment-confirmation',
            context: {
                userName: `${user.firstName} ${user.lastName}`,
                reservationNumber: booking.reservationNumber,
                paymentReference: booking.payment.reference,
                paidAmount: booking.payment.paidAmount,
                paymentMethod: booking.payment.method,
                currency: booking.pricing.currency,
                frontendUrl: process.env.FRONTEND_URL,
                year: new Date().getFullYear()
            }
        });
    } catch (error) {
        logError('Failed to send payment confirmation email', error);
    }
};

// Password reset email
export const sendPasswordResetEmail = async (user: any, resetToken: string) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            template: 'password-reset',
            context: {
                userName: `${user.firstName} ${user.lastName}`,
                resetUrl,
                expiryTime: '1 hour',
                frontendUrl: process.env.FRONTEND_URL,
                year: new Date().getFullYear()
            }
        });
        logInfo('Password reset email sent', { userId: user._id });
    } catch (error) {
        logError('Failed to send password reset email', error);
        throw error;
    }
};

// Email verification email
export const sendVerificationEmail = async (user: any, verificationToken: string) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Verify Your Email Address',
            template: 'email-verification',
            context: {
                userName: `${user.firstName} ${user.lastName}`,
                verificationUrl,
                frontendUrl: process.env.FRONTEND_URL,
                year: new Date().getFullYear()
            }
        });
        logInfo('Verification email sent', { userId: user._id });
    } catch (error) {
        logError('Failed to send verification email', error);
        throw error;
    }
};

// Welcome email
export const sendWelcomeEmail = async (user: any) => {
    try {
        await sendEmail({
            to: user.email,
            subject: 'Welcome to Vanuatu Booking System',
            template: 'welcome',
            context: {
                userName: `${user.firstName} ${user.lastName}`,
                loginUrl: `${process.env.FRONTEND_URL}/login`,
                frontendUrl: process.env.FRONTEND_URL,
                year: new Date().getFullYear()
            }
        });
    } catch (error) {
        logError('Failed to send welcome email', error);
    }
};

// Check-in reminder email
export const sendCheckInReminder = async (booking: any, user: any) => {
    try {
        await sendEmail({
            to: user.email,
            subject: `Check-in Reminder - ${booking.reservationNumber}`,
            template: 'check-in-reminder',
            context: {
                userName: `${user.firstName} ${user.lastName}`,
                reservationNumber: booking.reservationNumber,
                checkInDate: booking.checkInDate,
                bookingType: booking.bookingType,
                frontendUrl: process.env.FRONTEND_URL,
                bookingUrl: `${process.env.FRONTEND_URL}/booking/${booking._id}`,
                year: new Date().getFullYear()
            }
        });
    } catch (error) {
        logError('Failed to send check-in reminder', error);
    }
};

export default {
    sendEmail,
    sendBookingConfirmation,
    sendBookingCancellation,
    sendPaymentConfirmation,
    sendPasswordResetEmail,
    sendVerificationEmail,
    sendWelcomeEmail,
    sendCheckInReminder
};
