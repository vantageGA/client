import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './Message.scss';

const Message = ({
  message,
  variant = 'error',
  onDismiss = null,
  autoClose = null,
  isVisible = undefined,
  success = undefined, // Deprecated: for backward compatibility
}) => {
  const [internalVisible, setInternalVisible] = useState(true);
  const messageRef = useRef(null);

  // Backward compatibility: convert success boolean to variant
  const actualVariant = success ? 'success' : variant;

  // Support both controlled and uncontrolled patterns
  const controlled = isVisible !== undefined;
  const visible = controlled ? isVisible : internalVisible;

  // Auto-close effect
  useEffect(() => {
    if (!visible || !autoClose) return;

    const timer = setTimeout(() => {
      if (!controlled) {
        setInternalVisible(false);
      }
      onDismiss?.();
    }, autoClose);

    return () => clearTimeout(timer);
  }, [visible, autoClose, controlled, onDismiss]);

  // Focus management for accessibility
  useEffect(() => {
    if (visible && messageRef.current) {
      messageRef.current.focus();
    }
  }, [visible]);

  if (!visible) return null;

  const handleDismiss = () => {
    if (!controlled) {
      setInternalVisible(false);
    }
    onDismiss?.();
  };

  return (
    <div
      ref={messageRef}
      className={`message-wrapper message-${actualVariant}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={-1}
    >
      <div className="message-content">
        <span className="message-text">{message}</span>
        <button
          type="button"
          className="message-close-btn"
          onClick={handleDismiss}
          aria-label={`Close ${actualVariant} notification`}
        >
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
};

Message.propTypes = {
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['success', 'error', 'warning']),
  onDismiss: PropTypes.func,
  autoClose: PropTypes.number,
  isVisible: PropTypes.bool,
  success: PropTypes.bool, // Deprecated: use variant="success" instead
};

export default Message;
