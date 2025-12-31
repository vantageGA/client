import React from 'react';
import PropTypes from 'prop-types';
import './PasswordStrength.scss';
import { getPasswordStrength, getPasswordRequirements } from '../../utils/validation';

const PasswordStrength = ({ password, showRequirements = true }) => {
  const strength = getPasswordStrength(password);
  const requirements = getPasswordRequirements(password);

  if (!password || password.length === 0) {
    return null;
  }

  return (
    <div className="password-strength-wrapper">
      {/* Strength Indicator Bar */}
      <div className="password-strength-meter">
        <div className="strength-label">
          <span>Password Strength: </span>
          <span className={`strength-text strength-${strength.level}`}>
            {strength.label}
          </span>
        </div>
        <div className="strength-bar-container">
          <div
            className={`strength-bar strength-bar-${strength.level}`}
            style={{ width: `${(strength.score / 3) * 100}%` }}
            role="progressbar"
            aria-valuenow={strength.score}
            aria-valuemin="0"
            aria-valuemax="3"
            aria-label={`Password strength: ${strength.label}`}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="password-requirements">
          <p className="requirements-title">Password must contain:</p>
          <ul className="requirements-list" role="list">
            {requirements.map((req) => (
              <li
                key={req.id}
                className={`requirement-item ${req.met ? 'met' : 'unmet'}`}
                role="listitem"
              >
                <span className="requirement-icon" aria-hidden="true">
                  {req.met ? '\u2713' : '\u2717'}
                </span>
                <span className="requirement-text">{req.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

PasswordStrength.propTypes = {
  password: PropTypes.string.isRequired,
  showRequirements: PropTypes.bool,
};

export default PasswordStrength;
