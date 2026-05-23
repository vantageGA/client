import React from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

const Button = ({
  text,
  disabled = false,
  title,
  onClick,
  type = 'button',
  className = '',
  children,
  ...rest
}) => {
  const buttonClassName = [
    'btn',
    disabled ? 'disabled' : 'not-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClassName}
      title={title}
      disabled={disabled}
      {...rest}
    >
      {children || text}
    </button>
  );
};

Button.propTypes = {
  type: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Button;
