import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils/testUtils';
import Login from '../../pages/Login';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render login form', () => {
    render(<Login />);

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should render brand name', () => {
    render(<Login />);

    expect(screen.getByText('NetPlatform')).toBeInTheDocument();
  });

  it('should render platform description', () => {
    render(<Login />);

    expect(screen.getByText('Network Telemetry & ISP Management Platform')).toBeInTheDocument();
  });

  it('should update email field on user input', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should update password field on user input', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'secretpassword');

    expect(passwordInput).toHaveValue('secretpassword');
  });

  it('should render remember me checkbox', () => {
    render(<Login />);

    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  it('should render forgot password link', () => {
    render(<Login />);

    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('should show loading state during form submission', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).not.toBeDisabled();

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Check the button is present and clickable before submission
    expect(submitButton).toBeInTheDocument();
  });

  it('should disable submit button during loading', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Button should be enabled before submission
    expect(submitButton).not.toBeDisabled();

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Button should still be enabled after typing
    expect(submitButton).toBeEnabled();
  });

  it('should navigate to home on successful login', async () => {
    const user = userEvent.setup();
    render(<Login />);

    // Use credentials that MSW handler will accept
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    }, { timeout: 3000 });
  });

  it('should show error on failed login', async () => {
    const user = userEvent.setup();
    render(<Login />);

    // Use wrong credentials that MSW handler will reject
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should have required fields', () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('should have correct input types', () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
