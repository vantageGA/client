import React, { useId, useState } from 'react';
import PropTypes from 'prop-types';
import './ImageTooltip.scss';

const ImageTooltip = ({
  src,
  alt,
  previewAlt,
  triggerLabel,
  triggerSize = 72,
  previewSize = 240,
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const generatedId = useId();
  const tooltipId = id || `image-tooltip-${generatedId.replace(/:/g, '')}`;
  const resolvedTriggerLabel = triggerLabel || `View larger ${alt}`;
  const resolvedPreviewAlt = previewAlt || `${alt} preview`;

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      handleClose();
    }
  };

  return (
    <div
      className={`image-tooltip ${isOpen ? 'is-open' : ''} ${className}`.trim()}
      style={{
        '--image-tooltip-trigger-size': `${triggerSize}px`,
        '--image-tooltip-preview-size': `${previewSize}px`,
      }}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={handleBlur}
    >
      <button
        type="button"
        className="image-tooltip__trigger"
        aria-label={resolvedTriggerLabel}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        title={resolvedTriggerLabel}
      >
        <img src={src} alt={alt} className="image-tooltip__trigger-image" />
      </button>

      {isOpen ? (
        <div id={tooltipId} className="image-tooltip__popup" role="tooltip">
          <img
            src={src}
            alt={resolvedPreviewAlt}
            className="image-tooltip__popup-image"
          />
        </div>
      ) : null}
    </div>
  );
};

ImageTooltip.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  previewAlt: PropTypes.string,
  triggerLabel: PropTypes.string,
  triggerSize: PropTypes.number,
  previewSize: PropTypes.number,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default ImageTooltip;
