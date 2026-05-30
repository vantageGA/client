import React from 'react';
import './SearchInput.scss';
import PropTypes from 'prop-types';

const SearchInput = ({
  type = 'search',
  placeholder,
  handleSearch,
  className,
  value,
  label,
  id,
  ariaLabel,
  ariaDescribedBy,
  autoFocus = false,
}) => {
  return (
    <>
      <div className="search-input-wrapper">
        <input
          id={id}
          type={type}
          className={className}
          placeholder={placeholder}
          onChange={handleSearch}
          value={value}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          autoFocus={autoFocus}
        />
        <span className="bar"></span>
        <label htmlFor={id}>{label}</label>
      </div>
    </>
  );
};

SearchInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  handleSearch: PropTypes.func,
  className: PropTypes.string,
  label: PropTypes.string,
  id: PropTypes.string,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  autoFocus: PropTypes.bool,
};

export default SearchInput;
