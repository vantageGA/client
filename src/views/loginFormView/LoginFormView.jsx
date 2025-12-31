import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import LinkComp from '../../components/linkComp/LinkComp';
import { loginAction } from '../../store/actions/userActions';
import { isValidEmail } from '../../utils/validation';
import './LoginFormView.scss';

const LoginFormView = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const userLogin = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  const [showEmailVerificationMessage, setShowEmailVerificationMessage] = useState(false);

  useEffect(() => {
    if (userInfo && userInfo !== undefined) {
      navigate('/user-profile-edit');
    }
  }, [userInfo, navigate]);

  // Check if error is related to email verification
  useEffect(() => {
    if (error && error.toLowerCase().includes('verify your email')) {
      setShowEmailVerificationMessage(true);
    } else {
      setShowEmailVerificationMessage(false);
    }
  }, [error]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch login
    dispatch(loginAction(email, password));
  };

  return (
    <div className="login-form-wrapper">
      {error ? <Message message={error} variant="error" /> : null}

      {showEmailVerificationMessage && (
        <Message
          message="Please check your email and click the verification link to activate your account before logging in."
          variant="warning"
        />
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <fieldset className="fieldSet">
          <legend>Members Login form</legend>
          <form onSubmit={handleSubmit} noValidate>
            <InputField
              label="Email"
              type="email"
              name={email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              className={
                touched.email && email.length > 0 && !isValidEmail(email)
                  ? 'invalid'
                  : email.length > 0
                  ? 'entered'
                  : ''
              }
              error={
                touched.email &&
                !isValidEmail(email) &&
                email.length !== 0
                  ? `Invalid email address.`
                  : null
              }
              aria-invalid={touched.email && !isValidEmail(email)}
            />
            <InputField
              label="Password"
              type="password"
              name={password}
              value={password}
              required
              onBlur={() => handleBlur('password')}
              className={
                touched.password && !password.length
                  ? 'invalid'
                  : password.length > 0
                  ? 'entered'
                  : ''
              }
              error={
                touched.password && password.length === 0
                  ? `Password cannot be empty`
                  : null
              }
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={touched.password && !password.length}
            />

            <Button
              colour="transparent"
              text="submit"
              className="btn"
              disabled={!password.length || !isValidEmail(email)}
            ></Button>
          </form>
        </fieldset>
      )}

      <div className="login-form-inner-wrapper">
        <p>
          New to our platform ?{' '}
          <LinkComp route="registration" routeName="Register" /> here.
        </p>
        <p>
          Forgot your password ?{' '}
          <LinkComp route="forgot-password" routeName="Reset" /> here.
        </p>
      </div>
    </div>
  );
};

export default LoginFormView;
