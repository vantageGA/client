import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './ReviewerForgotPassword.scss';

import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import Message from '../../components/message/Message';
import { reviewerForgotPasswordAction } from '../../store/actions/userReviewActions';
import { isValidEmail } from '../../utils/validation';

const ReviewerForgotPassword = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState({ email: false });
  const [pendingFocusId, setPendingFocusId] = useState('');

  const reviewerForgotPassword = useSelector(
    (state) => state.reviewerForgotPassword,
  );
  const { error, success } = reviewerForgotPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setPendingFocusId('reviewer-forgot-password-email');
      return;
    }
    dispatch(reviewerForgotPasswordAction(email));
    setEmail('');
  };

  const handleBlur = () => {
    setTouched({ email: true });
  };

  React.useEffect(() => {
    if (!pendingFocusId) return;

    requestAnimationFrame(() => {
      const element = document.getElementById(pendingFocusId);
      if (element && typeof element.focus === 'function') {
        element.focus();
      }
      setPendingFocusId('');
    });
  }, [pendingFocusId]);

  return (
    <div className="reviewer-forgot-password-wrapper">
      {error ? <Message message={error} variant="error" /> : null}
      {success ? (
        <Message
          message="If that email exists in our system, a password reset link has been sent. Please check your email and follow the instructions."
          variant="success"
        />
      ) : null}

      <fieldset className="fieldSet">
        <legend>
          Reviewer <span>Forgot Password</span>
        </legend>
        <form onSubmit={handleSubmit} noValidate>
          <InputField
            id="reviewer-forgot-password-email"
            label="Your registered email address"
            type="email"
            name="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleBlur}
            className={
              touched.email && !isValidEmail(email) && email.length > 0
                ? 'invalid'
                : email.length > 0
                ? 'entered'
                : ''
            }
            error={
              touched.email && !isValidEmail(email) && email.length !== 0
                ? `Invalid email address.`
                : null
            }
            aria-invalid={touched.email && !isValidEmail(email)}
          />

          <Button
            
            text="Send reset link"
            className="btn"
            disabled={!isValidEmail(email)}
          ></Button>
        </form>
      </fieldset>
    </div>
  );
};

export default ReviewerForgotPassword;
