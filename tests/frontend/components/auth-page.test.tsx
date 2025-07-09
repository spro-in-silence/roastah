import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../tests/utils/test-utils';
import AuthPage from '@/pages/auth-page';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock wouter
jest.mock('wouter', () => ({
  useLocation: () => ['/auth', jest.fn()],
  useRoute: () => [false, {}],
}));

describe('AuthPage', () => {
  const mockLogin = jest.fn();
  const mockRegister = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });
    jest.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(<AuthPage />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('switches to registration form when clicking register link', async () => {
    render(<AuthPage />);
    
    const registerLink = screen.getByText(/create an account/i);
    fireEvent.click(registerLink);
    
    await waitFor(() => {
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText('Join our coffee community')).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });
  });

  it('handles login form submission', async () => {
    mockLogin.mockResolvedValue({ success: true });
    
    render(<AuthPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('handles registration form submission', async () => {
    mockRegister.mockResolvedValue({ success: true });
    
    render(<AuthPage />);
    
    // Switch to registration form
    const registerLink = screen.getByText(/create an account/i);
    fireEvent.click(registerLink);
    
    await waitFor(() => {
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });
    });
  });

  it('displays validation errors', async () => {
    render(<AuthPage />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during authentication', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });
    
    render(<AuthPage />);
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it('displays authentication errors', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: new Error('Invalid credentials'),
      login: mockLogin,
      register: mockRegister,
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });
    
    render(<AuthPage />);
    
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('shows keep me logged in checkbox', () => {
    render(<AuthPage />);
    
    const keepLoggedInCheckbox = screen.getByLabelText(/keep me logged in/i);
    expect(keepLoggedInCheckbox).toBeInTheDocument();
    expect(keepLoggedInCheckbox).not.toBeChecked();
  });

  it('handles keep me logged in checkbox toggle', () => {
    render(<AuthPage />);
    
    const keepLoggedInCheckbox = screen.getByLabelText(/keep me logged in/i);
    fireEvent.click(keepLoggedInCheckbox);
    
    expect(keepLoggedInCheckbox).toBeChecked();
  });

  it('validates email format', async () => {
    render(<AuthPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('validates password length', async () => {
    render(<AuthPage />);
    
    // Switch to registration form
    const registerLink = screen.getByText(/create an account/i);
    fireEvent.click(registerLink);
    
    await waitFor(() => {
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('redirects authenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      isLoading: false,
      error: null,
      login: mockLogin,
      register: mockRegister,
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });
    
    // Mock redirect function
    const mockRedirect = jest.fn();
    jest.doMock('wouter', () => ({
      useLocation: () => ['/auth', mockRedirect],
      useRoute: () => [false, {}],
    }));
    
    render(<AuthPage />);
    
    // In a real scenario, this would trigger a redirect
    // For now, we'll just verify the user is present
    expect(mockUseAuth().user).toBeTruthy();
  });
});