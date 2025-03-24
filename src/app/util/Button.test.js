import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

// Mock function to test click behavior
const mockOnClick = jest.fn();

describe('Button Component', () => {
  test('renders the button with the correct text', () => {
    render(<Button text="Click Me" />);
    
    const button = screen.getByText(/Click Me/i);
    expect(button).not.toBeNull();  // Ensure the button is rendered in the document
  });

  test('calls the onClick handler when clicked', () => {
    render(<Button text="Click Me" onClick={mockOnClick} />);
    
    // Find the button by text and simulate a click event
    const button = screen.getByText(/Click Me/i);
    fireEvent.click(button);
    
    // Verify that the onClick handler was called
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick if no handler is passed', () => {
    render(<Button text="Click Me" />);
    
    // Find the button by text and simulate a click event
    const button = screen.getByText(/Click Me/i);
    fireEvent.click(button);
    
    // Verify that the onClick handler was not called
    expect(mockOnClick).toHaveBeenCalledTimes(0);
  });
});
