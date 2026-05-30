import React, { useRef, useEffect, useState } from 'react';
import './InputField.scss';
import PropTypes from 'prop-types';

import { FaEye, FaEyeSlash } from 'react-icons/fa';

const InputField = ({
  id,
  type = 'text',
  label,
  name,
  value,
  placeholder,
  error,
  hint,
  className,
  onChange,
  onBlur,
  required,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
  autoFocus = false,
}) => {
  const inputFocus = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const onlyPassword = type === 'password';

  useEffect(() => {
    if (!inputFocus.current) {
      return;
    }

    if (autoFocus) {
      inputFocus.current.focus();
    }
  }, [autoFocus]);

  const handleShowHidePw = () => {
    if (inputFocus.current.type === 'password') {
      setShowPassword((prevState) => !prevState);
      inputFocus.current.type = 'text';
    } else {
      setShowPassword((prevState) => !prevState);
      inputFocus.current.type = 'password';
    }
  };

  const errorId = `${id || name}-error`;
  const hintId = `${id || name}-hint`;

  return (
    <div className="input-field-wrapper">
      <div className="input-icon-wrapper">
        {label && (
          <label htmlFor={id || name}>
            {label}
            {required && <span aria-label="required"> *</span>}
          </label>
        )}
        {onlyPassword ? (
          <div
            onClick={() => handleShowHidePw()}
            title={!showPassword ? 'SHOW PASSWORD' : 'HIDE PASSWORD'}
          >
            {!showPassword ? (
              <FaEye className="icon-colour" />
            ) : (
              <FaEyeSlash className="icon-colour" />
            )}
          </div>
        ) : null}
      </div>
      <input
        id={id || name}
        ref={inputFocus}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        className={className}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        aria-invalid={ariaInvalid}
        autoFocus={autoFocus}
        aria-describedby={
          [hint && hintId, error && errorId, ariaDescribedby]
            .filter(Boolean)
            .join(' ') || undefined
        }
      />
      {hint && (
        <span id={hintId} className="field-hint">
          {hint}
        </span>
      )}
      {error && (
        <p id={errorId} className="validation-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

InputField.propTypes = {
  text: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  onChange: PropTypes.func,
  autoFocus: PropTypes.bool,
};

export default InputField;
