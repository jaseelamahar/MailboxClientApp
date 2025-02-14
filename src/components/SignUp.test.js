import { render, screen, fireEvent } from '@testing-library/react';
import SignUp from './SignUp'; 

describe('SignUp Component', () => {
  test('renders signup form with email and password fields', () => {
    render(<SignUp />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
   expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
  });

  test('displays an alert when passwords do not match', () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<SignUp />);

    fireEvent.change(screen.getByPlaceholderText('Enter email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'wrongpassword' } });

    fireEvent.click(screen.getByText('Sign Up'));

    expect(window.alert).toHaveBeenCalledWith('Passwords do not match!');
  });

  test('signup button is present and clickable', () => {
    render(<SignUp />);
    const signUpButton = screen.getByText('Sign Up');
    expect(signUpButton).toBeInTheDocument();
    fireEvent.click(signUpButton);
  });

  test('renders login link', () => {
    render(<SignUp />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
})
test('renders signup form with email and password fields', () => {
    render(<SignUp />);
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });