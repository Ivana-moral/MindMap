import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar'; // adjust path if needed
import { useRouter } from 'next/navigation';

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush });
    localStorage.clear();
    document.documentElement.setAttribute('data-theme', 'light');
  });

  test('renders the Navbar with logo and icons', () => {
    render(<Navbar />);

    // Logo
    const logo = screen.getByText(/MindMap/i);
    expect(logo).not.toBeNull();

    // Theme toggle icon (moon/sun)
    const iconButtons = screen.getAllByRole('button');
    expect(iconButtons.length).toBeGreaterThanOrEqual(3); // theme, account, menu
  });

  test('navigates to home page when logo is clicked', () => {
    render(<Navbar />);

    const logo = screen.getByText(/MindMap/i);
    fireEvent.click(logo);

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('toggles theme when the theme button is clicked', () => {
    render(<Navbar />);

    const themeButton = screen.getAllByRole('button')[0]; // first button is theme toggle
    fireEvent.click(themeButton);

    const currentTheme = document.documentElement.getAttribute('data-theme');
    expect(currentTheme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  test('toggles the sidebar when the menu button is clicked', () => {
    render(<Navbar />);

    const menuButton = screen.getAllByRole('button')[2]; // third button is menu toggle
    fireEvent.click(menuButton);

    const sidebar = document.querySelector('.sidebar');
    expect(sidebar.className).toContain('show');

    const closeButton = screen.getByLabelText('Close Sidebar');
    fireEvent.click(closeButton);

    expect(document.querySelector('.sidebar').className).not.toContain('show');
  });

  test('navigates to Courses page from sidebar', () => {
    render(<Navbar />);

    const menuButton = screen.getAllByRole('button')[2];
    fireEvent.click(menuButton);

    const coursesLink = screen.getByText(/Courses/i);
    fireEvent.click(coursesLink);

    expect(mockPush).toHaveBeenCalledWith('/coursepage');
  });
});
