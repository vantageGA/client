import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { contactFormMessageAction } from '../../store/actions/contactFormActions';
import { CONTACT_FORM_RESET } from '../../store/constants/contactFormConstants';
import './ContactFormView.scss';

import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';

const ContactFormView = ({ type }) => {
  // Simplified name regex - accepts letters, spaces, hyphens, apostrophes (min 2 chars)
  const nameRegEx = /^[a-zA-Z\s'-]{2,}$/;
  const emailRegEx =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  const dispatch = useDispatch();
  const contactForm = useSelector((state) => state.contactForm);
  const { loading, success, error, payload } = contactForm;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, message: false });

  useEffect(() => {
    dispatch({ type: CONTACT_FORM_RESET });
    return () => {
      console.log('Contact form cleanup');
    };
  }, [dispatch]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call action creator function
    dispatch(contactFormMessageAction(name, email, message));
    setName('');
    setEmail('');
    setMessage('');
    // Reset touched state after submission
    setTouched({ name: false, email: false, message: false });
  };

  // Validation helpers
  const isNameValid = nameRegEx.test(name);
  const isEmailValid = emailRegEx.test(email);
  const isMessageValid = message.length >= 10;
  const isFormValid = isNameValid && isEmailValid && isMessageValid;

  // Show errors only after field has been touched
  const showNameError = touched.name && !isNameValid && name.length !== 0;
  const showEmailError = touched.email && !isEmailValid && email.length !== 0;
  const showMessageError = touched.message && !isMessageValid;

  return (
    <>
      {loading ? (
        <div role="status" aria-live="polite" aria-busy="true">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="contact-form-view-wrapper" aria-busy="false">
          {success && (
            <div className="success-message-container">
              <Message message="Form successfully submitted" variant="success" autoClose={5000} />
            </div>
          )}
          {error && (
            <div className="error-message-container">
              <Message message={payload} error={error} />
            </div>
          )}

          <fieldset className="fieldSet form-fieldset">
            <legend>Contact Form</legend>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <InputField
                  id="name"
                  label="Name"
                  type="text"
                  name="name"
                  value={name}
                  required
                  hint="Minimum 2 characters"
                  className={showNameError ? 'invalid' : isNameValid ? 'entered' : ''}
                  error={showNameError ? 'Name must contain at least 2 characters.' : null}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  aria-invalid={showNameError}
                  aria-describedby={showNameError ? 'name-error' : undefined}
                />
              </div>

              <div className="form-group">
                <InputField
                  id="email"
                  label="Email"
                  type="email"
                  name="email"
                  value={email}
                  required
                  hint="Valid email format required"
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={showEmailError ? 'invalid' : isEmailValid ? 'entered' : ''}
                  error={showEmailError ? 'Invalid email address.' : null}
                  aria-invalid={showEmailError}
                  aria-describedby={showEmailError ? 'email-error' : undefined}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  Message <span className="required-asterisk" aria-label="required">*</span>
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => handleBlur('message')}
                  name="message"
                  className={showMessageError ? 'invalid' : isMessageValid ? 'entered' : ''}
                  aria-required="true"
                  aria-invalid={showMessageError}
                  aria-describedby={`message-hint${showMessageError ? ' message-error' : ''}`}
                />
                <span id="message-hint" className="field-hint">
                  {message.length < 10
                    ? `Requires 10 characters (currently ${message.length})`
                    : 'Message meets minimum length requirement'}
                </span>
                {showMessageError && (
                  <p id="message-error" className="validation-error">
                    Message must be at least 10 characters long.
                  </p>
                )}
              </div>

              <Button
                colour="transparent"
                text="Submit"
                className="btn"
                type="submit"
                disabled={!isFormValid}
              />
            </form>
          </fieldset>

          <fieldset className="fieldSet contact-details-fieldset">
            <legend>Contact Details</legend>
            <address className="contact-details">
              <div className="contact-detail-item">
                <strong>Address:</strong>
                <span>1233 Main Street, London, UK</span>
              </div>
              <div className="contact-detail-item">
                <strong>Phone:</strong>
                <a href="tel:+44113" aria-label="Call us at 113">
                  113
                </a>
              </div>
              <div className="contact-detail-item">
                <strong>Email:</strong>
                <a href="mailto:something@mail.com" aria-label="Email us at something@mail.com">
                  something@mail.com
                </a>
              </div>
            </address>
          </fieldset>
        </div>
      )}
    </>
  );
};

export default ContactFormView;
