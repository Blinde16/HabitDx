/**
 * Validation utility functions for forms
 */

export const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return undefined;
};

export const validatePassword = (password: string, minLength: number = 8): string | undefined => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }

  return undefined;
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): string | undefined => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return undefined;
};

export const validateName = (name: string): string | undefined => {
  if (!name.trim()) {
    return 'Name is required';
  }

  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }

  return undefined;
};

export const getPasswordStrength = (
  password: string
): {
  strength: 'weak' | 'medium' | 'strong';
  label: string;
  color: string;
} => {
  if (password.length === 0) {
    return { strength: 'weak', label: '', color: '#6b7280' };
  }

  if (password.length < 6) {
    return { strength: 'weak', label: 'Weak', color: '#ef4444' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(
    Boolean
  ).length;

  if (password.length >= 10 && criteriaCount >= 3) {
    return { strength: 'strong', label: 'Strong', color: '#10b981' };
  }

  if (password.length >= 8 && criteriaCount >= 2) {
    return { strength: 'medium', label: 'Medium', color: '#f59e0b' };
  }

  return { strength: 'weak', label: 'Weak', color: '#ef4444' };
};
