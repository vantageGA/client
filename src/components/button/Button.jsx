import React from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

const Button = ({
  text,
  disabled = false,
  title,
  onClick,
  type,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={disabled ? 'btn disabled' : 'btn not-disabled'}
      title={title}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

Button.propTypes = {
  type: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Button;
