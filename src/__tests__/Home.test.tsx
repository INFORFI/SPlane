import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '@/app/(public)/page';

describe('Home', () => {
  it('renders the home page', () => {
    render(<Home />);

    const title = screen.getByText('SPLANE');

    expect(title).toBeInTheDocument();
  });
});
