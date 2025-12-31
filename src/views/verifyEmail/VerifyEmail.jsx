import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './VerifyEmail.scss';

import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import LinkComp from '../../components/linkComp/LinkComp';
import { verifyEmailAction } from '../../store/actions/userActions';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const userEmailVerify = useSelector((state) => state.userEmailVerify);
  const { loading, error, success, message } = userEmailVerify;

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      // No token provided
      return;
    }

    // Dispatch verification action
    dispatch(verifyEmailAction(token));
  }, [dispatch, token]);

  useEffect(() => {
    if (success) {
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
  }, [success, navigate]);

  return (
    <div className="verify-email-wrapper">
      <fieldset className="fieldSet">
        <legend>
          Email <span>Verification</span>
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
                Unable to verify your email. The link may have expired or is
                invalid.
              </p>
              <LinkComp route="login" routeName="Go to Login" />
            </div>
          </>
        ) : success ? (
          <>
            <Message
              message={message || 'Email verified successfully!'}
              variant="success"
            />
            <div className="verification-success">
              <p>Your email has been successfully verified.</p>
              <p>You can now log in to your account.</p>
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

export default VerifyEmail;
