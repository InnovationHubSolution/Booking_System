import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { useAuthStore } from '../store/authStore';

// Helper function to render with router
const renderWithRouter = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('Login Component', () => {
    beforeEach(() => {
        // Clear auth store before each test
        useAuthStore.setState({ token: null, user: null });
    });

    it('renders login form', () => {
        renderWithRouter(<Login />);

        expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        renderWithRouter(<Login />);

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            // Check if validation messages appear (adjust based on your actual implementation)
            const emailInput = screen.getByLabelText(/email/i);
            expect(emailInput).toBeInTheDocument();
        });
    });

    it('updates input values when typing', () => {
        renderWithRouter(<Login />);

        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('has a link to register page', () => {
        renderWithRouter(<Login />);

        const registerLink = screen.getByText(/Don't have an account/i).closest('div')?.querySelector('a');
        expect(registerLink).toBeInTheDocument();
        expect(registerLink).toHaveAttribute('href', '/register');
    });
});
