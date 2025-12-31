/**
 * Validation utilities for form inputs
 * Aligned with backend Joi validation requirements
 */

// Email validation regex - matches backend validation
export const emailRegEx =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Name validation regex - 2-100 chars, letters, spaces, hyphens, apostrophes only
export const nameRegEx = /^[a-zA-Z\s'-]{2,100}$/;

// Strong password validation - min 8 chars, uppercase, lowercase, number, special char
// Backend requires: @$!%*?& as special chars
export const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  return emailRegEx.test(email);
};

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid
 */
export const isValidName = (name) => {
  return nameRegEx.test(name);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid
 */
export const isValidPassword = (password) => {
  return passwordRegEx.test(password);
};

/**
 * Get password strength level
 * @param {string} password - Password to check
 * @returns {Object} Strength details
 */
export const getPasswordStrength = (password) => {
  if (!password || password.length === 0) {
    return {
      level: 'none',
      label: '',
      score: 0,
    };
  }

  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[@$!%*?&]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;

  if (passedChecks <= 2) {
    return {
      level: 'weak',
      label: 'Weak',
      score: 1,
      checks,
    };
  } else if (passedChecks === 3 || passedChecks === 4) {
    return {
      level: 'medium',
      label: 'Medium',
      score: 2,
      checks,
    };
  } else {
    return {
      level: 'strong',
      label: 'Strong',
      score: 3,
      checks,
    };
  }
};

/**
 * Get password requirements checklist
 * @param {string} password - Password to check
 * @returns {Array} Array of requirement objects
 */
export const getPasswordRequirements = (password = '') => {
  return [
    {
      id: 'minLength',
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      id: 'hasUppercase',
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      id: 'hasLowercase',
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      id: 'hasNumber',
      label: 'Contains number',
      met: /\d/.test(password),
    },
    {
      id: 'hasSpecial',
      label: 'Contains special character (@$!%*?&)',
      met: /[@$!%*?&]/.test(password),
    },
  ];
};

/**
 * Validate if two passwords match
 * @param {string} password - First password
 * @param {string} confirmPassword - Confirmation password
 * @returns {boolean} True if matching
 */
export const doPasswordsMatch = (password, confirmPassword) => {
  return password === confirmPassword && password.length > 0;
};
