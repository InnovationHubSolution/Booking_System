import request from 'supertest';
import app from '../server';
import User from '../models/User';
import bcrypt from 'bcryptjs';

describe('Auth Routes', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    firstName: 'Test',
                    lastName: 'User',
                    phone: '+678 123 456'
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.email).toBe('test@example.com');
        });

        it('should not register user with existing email', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    firstName: 'Test',
                    lastName: 'User'
                });

            // Second registration with same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password456',
                    firstName: 'Another',
                    lastName: 'User'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('User already exists');
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: '123', // too short
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                email: 'test@example.com',
                password: hashedPassword,
                firstName: 'Test',
                lastName: 'User',
                role: 'customer'
            });
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.email).toBe('test@example.com');
        });

        it('should not login with invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should not login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid credentials');
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                email: 'test@example.com',
                password: hashedPassword,
                firstName: 'Test',
                lastName: 'User',
                role: 'customer'
            });
        });

        it('should send reset password email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    email: 'test@example.com'
                });

            expect(res.status).toBe(200);
            expect(res.body.message).toContain('password reset link');

            const user = await User.findOne({ email: 'test@example.com' });
            expect(user?.resetPasswordToken).toBeDefined();
            expect(user?.resetPasswordExpiry).toBeDefined();
        });

        it('should return success even for non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    email: 'nonexistent@example.com'
                });

            expect(res.status).toBe(200);
        });
    });
});
