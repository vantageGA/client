import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './RegistrationView.scss';

import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import PasswordStrength from '../../components/passwordStrength/PasswordStrength';
import MembershipProposition from '../../components/membershipProposition/MembershipProposition';
import { registerAction } from '../../store/actions/userActions';
import { isValidName, isValidEmail, isValidPassword } from '../../utils/validation';

const RegistrationView = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const nameInputRef = useRef(null);

  const userRegistration = useSelector((state) => state.userRegistration);
  const { loading, error, success, userInfo } = userRegistration;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [registrationConfirmation, setRegistrationConfirmation] = useState('');
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (userInfo && userInfo !== undefined) {
      const warn =
        userInfo.message ||
        userInfo.name +
          ' your profile is created.' +
          ' You should have received an email with a link asking to confirm your email address.' +
          ' Please do this before logging in, in order to give you full functionality.';
      setRegistrationConfirmation(warn);
    }
  }, [userInfo, navigate]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Contact form action
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      // Dispatch registration data
      dispatch(registerAction(name, email, password));
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleMembershipClick = () => {
    // Scroll to the form and focus the name input
    if (nameInputRef.current) {
      nameInputRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Focus after scroll animation completes
      setTimeout(() => {
        const inputElement = nameInputRef.current.querySelector('input');
        if (inputElement) {
          inputElement.focus();
        }
      }, 500);
    }
  };

  return (
    <div className="registrationView-wrapper">
      {error ? <Message message={error} /> : null}
      {message ? <Message message={message} /> : null}
      {success ? <Message message={registrationConfirmation} variant="success" autoClose={5000} /> : null}

      {!userInfo && loading ? (
        <LoadingSpinner />
      ) : (
        <div className="registration-container">
          {/* Membership Proposition */}
          <MembershipProposition onApplyClick={handleMembershipClick} />

          {/* Registration Form */}
          <fieldset className="fieldSet">
              <legend>Member Registration</legend>
              <form onSubmit={handleSubmit} noValidate>
                <div ref={nameInputRef}>
                  <InputField
                    label="Name"
                    placeholder="Ben Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => handleBlur('name')}
                    type="text"
                    name="name"
                    required
                    hint="2-100 characters, letters, spaces, hyphens and apostrophes only"
                    className={
                      touched.name && !isValidName(name) && name.length > 0
                        ? 'invalid'
                        : name.length > 0
                        ? 'entered'
                        : ''
                    }
                    error={
                      touched.name && !isValidName(name) && name.length !== 0
                        ? `Name must be 2-100 characters using only letters, spaces, hyphens and apostrophes.`
                        : null
                    }
                    aria-invalid={touched.name && !isValidName(name)}
                  />
                </div>

            <InputField
              label="Email"
              type="email"
              name={email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
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

            <InputField
              label="Password"
              type="password"
              name={password}
              value={password}
              required
              onBlur={() => handleBlur('password')}
              className={
                touched.password &&
                !isValidPassword(password) &&
                password.length > 0
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
              label="Confirm Password"
              type="password"
              name={confirmPassword}
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
                touched.confirmPassword &&
                !isValidPassword(confirmPassword)
              }
            />

            {touched.confirmPassword && confirmPassword.length > 0 && (
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

                  text="submit"
                  className="btn"
                  disabled={
                    !isValidName(name) ||
                    !isValidPassword(password) ||
                    !isValidPassword(confirmPassword) ||
                    !isValidEmail(email) ||
                    password !== confirmPassword
                  }
                ></Button>
              </form>
            </fieldset>
        </div>
      )}
    </div>
  );
};

export default RegistrationView;
