import { render, screen, fireEvent } from '@testing-library/react';
import AddToCartButton from '@/components/AddToCartButton';

describe('AddToCartButton', () => {
  it('renders correctly and handles click', () => {
    const mockOnClick = jest.fn();
    render(<AddToCartButton onClick={mockOnClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalled();
  });
});
