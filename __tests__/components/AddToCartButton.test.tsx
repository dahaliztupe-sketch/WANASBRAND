import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { AddToCartButton } from '@/components/AddToCartButton';
import { updateCartItem } from '@/app/actions/cart';

// Mock the server action
jest.mock('@/app/actions/cart', () => ({
  updateCartItem: jest.fn(),
}));

// Mock haptics
jest.mock('@/lib/utils/haptics', () => ({
  triggerHaptic: jest.fn(),
}));

describe('AddToCartButton', () => {
  const mockSku = 'test-sku';
  const mockUserId = 'test-user';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with initial "Add to Bag" text', () => {
    render(<AddToCartButton sku={mockSku} userId={mockUserId} />);
    expect(screen.getByText(/Add to Bag/i)).toBeInTheDocument();
  });

  it('shows "Adding..." state immediately upon click (optimistic UI)', async () => {
    (updateCartItem as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<AddToCartButton sku={mockSku} userId={mockUserId} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByText(/Adding.../i)).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('calls updateCartItem with correct parameters', async () => {
    (updateCartItem as jest.Mock).mockResolvedValueOnce({});
    
    render(<AddToCartButton sku={mockSku} userId={mockUserId} />);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(updateCartItem).toHaveBeenCalledWith(mockUserId, mockSku, 1);
  });

  it('shows success message after API call completes', async () => {
    (updateCartItem as jest.Mock).mockResolvedValueOnce({});
    
    render(<AddToCartButton sku={mockSku} userId={mockUserId} />);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await waitFor(() => {
      expect(screen.getByText(/Added to Sanctuary/i)).toBeInTheDocument();
    });
  });
});
