import { describe, expect, it } from 'vitest';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_SPECIAL_CHARACTERS,
  getPasswordRequirements,
  isValidPassword,
} from './validation';

describe('password validation', () => {
  it('accepts a hyphen as the required special character', () => {
    expect(isValidPassword('Valid-Password1')).toBe(true);
  });

  it('accepts a hyphen alongside another allowed special character', () => {
    expect(isValidPassword('Valid-Password1!')).toBe(true);
  });

  it('rejects passwords longer than the backend limit', () => {
    expect(isValidPassword(`Aa1-${'a'.repeat(PASSWORD_MAX_LENGTH - 4)}`)).toBe(true);
    expect(isValidPassword(`Aa1-${'a'.repeat(PASSWORD_MAX_LENGTH - 3)}`)).toBe(false);
  });

  it('shows hyphen in the special character requirement label', () => {
    const specialRequirement = getPasswordRequirements('Valid-Password1').find(
      (requirement) => requirement.id === 'hasSpecial',
    );
    const maxLengthRequirement = getPasswordRequirements(
      `Aa1-${'a'.repeat(PASSWORD_MAX_LENGTH - 3)}`,
    ).find((requirement) => requirement.id === 'maxLength');

    expect(PASSWORD_SPECIAL_CHARACTERS).toContain('-');
    expect(specialRequirement).toMatchObject({
      label: `Contains special character (${PASSWORD_SPECIAL_CHARACTERS})`,
      met: true,
    });
    expect(maxLengthRequirement).toMatchObject({
      label: `No more than ${PASSWORD_MAX_LENGTH} characters`,
      met: false,
    });
  });
});
