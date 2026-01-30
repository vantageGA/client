import React, { useMemo, useState } from 'react';
import './FormSectionAccordion.scss';

const slugify = (value) =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const FormSectionAccordion = ({
  title,
  children,
  defaultOpen = false,
  isOpen: controlledOpen,
  onToggle,
  id,
  className = '',
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = typeof controlledOpen === 'boolean' ? controlledOpen : uncontrolledOpen;
  const panelId = useMemo(() => {
    const base = id || slugify(title) || 'section';
    return `form-section-${base}`;
  }, [id, title]);

  return (
    <section className={`form-section-accordion ${className}`.trim()}>
      <button
        type="button"
        className="form-section-toggle"
        onClick={() => {
          if (onToggle) {
            onToggle();
            return;
          }
          setUncontrolledOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="form-section-title">{title}</span>
        <i
          className={`fas ${isOpen ? 'fa-chevron-circle-up' : 'fa-chevron-circle-down'}`}
          aria-hidden="true"
        ></i>
      </button>
      <div
        id={panelId}
        className="form-section-panel"
        hidden={!isOpen}
      >
        {children}
      </div>
    </section>
  );
};

export default FormSectionAccordion;
