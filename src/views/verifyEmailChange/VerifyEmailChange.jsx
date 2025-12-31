import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './VerifyEmailChange.scss';

import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import LinkComp from '../../components/linkComp/LinkComp';
import { verifyEmailChangeAction, logoutAction } from '../../store/actions/userActions';

const VerifyEmailChange = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const userEmailChangeVerify = useSelector((state) => state.userEmailChangeVerify);
  const { loading, error, success, message } = userEmailChangeVerify;

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      // No token provided
      return;
    }

    // Dispatch email change verification action
    dispatch(verifyEmailChangeAction(token));
  }, [dispatch, token]);

  useEffect(() => {
    if (success) {
      // Log out the user since their email has changed
      // They need to log in with the new email
      setTimeout(() => {
        dispatch(logoutAction());
      }, 1000);

      // Start countdown timer
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [success, navigate, dispatch]);

  return (
    <div className="verify-email-change-wrapper">
      <fieldset className="fieldSet">
        <legend>
          Email Change <span>Verification</span>
        </legend>

        {!token ? (
          <Message
            message="No verification token provided. Please check your email for the verification link."
            variant="error"
          />
        ) : loading ? (
          <LoadingSpinner />
        ) : error ? (
          <>
            <Message message={error} variant="error" />
            <div className="verification-actions">
              <p>
                Unable to verify your email change. The link may have expired or is
                invalid.
              </p>
              <LinkComp route="profile-edit" routeName="Back to Profile" />
            </div>
          </>
        ) : success ? (
          <>
            <Message
              message={message || 'Email change verified successfully!'}
              variant="success"
            />
            <div className="verification-success">
              <p>Your email address has been successfully updated.</p>
              <p className="important-notice">
                Please log in using your new email address.
              </p>
              <p className="redirect-message">
                Redirecting to login in {redirectCountdown} seconds...
              </p>
              <LinkComp route="login" routeName="Go to Login Now" />
            </div>
          </>
        ) : null}
      </fieldset>
    </div>
  );
};

export default VerifyEmailChange;
