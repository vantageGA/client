import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './ReviewerResetPassword.scss';

import Message from '../../components/message/Message';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import LinkComp from '../../components/linkComp/LinkComp';
import PasswordStrength from '../../components/passwordStrength/PasswordStrength';

import { reviewerUpdatePasswordAction } from '../../store/actions/userReviewActions';
import { isValidPassword } from '../../utils/validation';

const ReviewerResetPassword = () => {
  const params = useParams();
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const [pendingFocusId, setPendingFocusId] = useState('');

  const reviewerUpdatePassword = useSelector(
    (state) => state.reviewerUpdatePassword,
  );
  const { success, error, message: successMessage } = reviewerUpdatePassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidPassword(password)) {
      setTouched((prev) => ({ ...prev, password: true }));
      setPendingFocusId('reviewer-reset-password');
      return;
    }
    if (!isValidPassword(confirmPassword)) {
      setTouched((prev) => ({ ...prev, confirmPassword: true }));
      setPendingFocusId('reviewer-reset-confirm-password');
      return;
    }
    if (password !== confirmPassword) {
      setPendingFocusId('reviewer-reset-confirm-password');
      setMessage('Passwords do not match');
    } else {
      dispatch(
        reviewerUpdatePasswordAction({
          resetPasswordToken: params.token,
          password,
        }),
      );
      setMessage(null);
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
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
    <div className="reviewer-reset-password-wrapper">
      {message ? <Message message={message} /> : null}
      {success ? (
        <>
          <Message message={successMessage} variant="success" autoClose={5000} />
          <div className="reset-password-links">
            <LinkComp route="reviewer-login" routeName="Login" />
          </div>
        </>
      ) : (
        <fieldset className="fieldSet">
          <legend>
            Reviewer <span>Reset Password</span>
          </legend>
          <form onSubmit={handleSubmit} noValidate>
            <InputField
              id="reviewer-reset-password"
              label="Password"
              type="password"
              name="password"
              value={password}
              required
              onBlur={() => handleBlur('password')}
              className={
                touched.password && !isValidPassword(password) && password.length > 0
                  ? 'invalid'
                  : password.length > 0
                  ? 'entered'
                  : ''
              }
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={touched.password && !isValidPassword(password)}
            />

            {password.length > 0 && <PasswordStrength password={password} />}

            <InputField
              id="reviewer-reset-confirm-password"
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              required
              onBlur={() => handleBlur('confirmPassword')}
              className={
                touched.confirmPassword &&
                !isValidPassword(confirmPassword) &&
                confirmPassword.length > 0
                  ? 'invalid'
                  : confirmPassword.length > 0
                  ? 'entered'
                  : ''
              }
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={
                touched.confirmPassword && !isValidPassword(confirmPassword)
              }
            />

            {confirmPassword.length > 0 && (
              <div
                className={
                  password === confirmPassword
                    ? 'password-match'
                    : 'password-mismatch'
                }
              >
                {password === confirmPassword
                  ? '\u2713 Passwords match'
                  : '\u2717 Passwords do not match'}
              </div>
            )}

            <Button
              
              text="Reset password"
              className="btn"
              disabled={
                !isValidPassword(password) ||
                !isValidPassword(confirmPassword) ||
                password !== confirmPassword
              }
            ></Button>
          </form>
        </fieldset>
      )}
      {error ? <Message message={error} /> : null}
    </div>
  );
};

export default ReviewerResetPassword;
