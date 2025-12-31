import React, { useState, useEffect, useRef } from 'react';
import './InfoComponent.scss';
import { FaInfoCircle } from 'react-icons/fa';

const InfoComponent = ({
  description,
  ariaLabel = "Show additional information",
  id,
  className = "",
  onDismiss,
}) => {
  const [showDescription, setShowDescription] = useState(false);
  const containerRef = useRef(null);
  const bubbleId = id ? `${id}-bubble` : 'info-bubble';

  // Toggle handler
  const handleToggle = () => {
    setShowDescription((prev) => {
      const newState = !prev;
      if (!newState && onDismiss) {
        onDismiss();
      }
      return newState;
    });
  };

  // Keyboard handler for Space/Enter
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  // Outside click handler
  useEffect(() => {
    if (!showDescription) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDescription(false);
        if (onDismiss) onDismiss();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDescription, onDismiss]);

  // ESC key handler
  useEffect(() => {
    if (!showDescription) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowDescription(false);
        if (onDismiss) onDismiss();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showDescription, onDismiss]);

  return (
    <div className={`info-wrapper ${className}`} ref={containerRef}>
      <button
        type="button"
        className="info-button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={showDescription}
        aria-label={ariaLabel}
        aria-describedby={showDescription ? bubbleId : undefined}
      >
        <FaInfoCircle aria-hidden="true" />
      </button>
      {showDescription && (
        <p id={bubbleId} className="bubble" role="status">
          {description}
        </p>
      )}
    </div>
  );
};

export default InfoComponent;
