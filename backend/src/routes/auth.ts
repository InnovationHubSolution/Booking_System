import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from '../services/emailService.enhanced';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { logInfo, logError } from '../config/logger';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */
router.post('/register', [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty()
], async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, firstName, lastName, phone } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone
        });

        await user.save();

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(user, verificationToken);
        } catch (emailError) {
            logError('Failed to send verification email', emailError);
        }

        // Send welcome email
        try {
            await sendWelcomeEmail(user);
        } catch (emailError) {
            logError('Failed to send welcome email', emailError);
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            userId: user._id,
            user: {
                userId: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isHost: user.isHost
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            userId: user._id,
            user: {
                userId: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isHost: user.isHost
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Request password reset
router.post('/forgot-password', [
    body('email').isEmail()
], catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
        return res.json({
            message: 'If an account exists with that email, a password reset link has been sent.'
        });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    try {
        await sendPasswordResetEmail(user, resetToken);
        logInfo('Password reset email sent', { userId: user._id });
    } catch (error) {
        logError('Failed to send password reset email', error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();
        throw new AppError('Error sending email. Please try again later.', 500);
    }

    res.json({
        message: 'If an account exists with that email, a password reset link has been sent.'
    });
}));

// Reset password
router.post('/reset-password', [
    body('token').notEmpty(),
    body('password').isLength({ min: 6 })
], catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Hash the token from URL to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    logInfo('Password reset successful', { userId: user._id });

    res.json({
        message: 'Password has been reset successfully. You can now log in with your new password.'
    });
}));

// Verify email
router.get('/verify-email/:token', catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;

    // Hash the token from URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        verificationToken: hashedToken,
        verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new AppError('Invalid or expired verification token', 400);
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    logInfo('Email verified', { userId: user._id });

    res.json({
        message: 'Email verified successfully! You can now use all features.'
    });
}));

// Resend verification email
router.post('/resend-verification', [
    body('email').isEmail()
], catchAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.json({ message: 'If an account exists, a verification email has been sent.' });
    }

    if (user.verified) {
        return res.status(400).json({ message: 'Email is already verified.' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    try {
        await sendVerificationEmail(user, verificationToken);
        logInfo('Verification email resent', { userId: user._id });
    } catch (error) {
        logError('Failed to resend verification email', error);
        throw new AppError('Error sending email. Please try again later.', 500);
    }

    res.json({ message: 'Verification email has been sent.' });
}));

export default router;
