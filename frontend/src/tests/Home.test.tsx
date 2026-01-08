import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

const renderWithRouter = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('Home Component', () => {
    it('renders main hero section', () => {
        renderWithRouter(<Home />);

        // Check for hero content (adjust based on your actual content)
        expect(screen.getByText(/Discover Vanuatu/i)).toBeInTheDocument();
    });

    it('renders navigation links', () => {
        renderWithRouter(<Home />);

        // Check if main sections are present
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
    });
});
