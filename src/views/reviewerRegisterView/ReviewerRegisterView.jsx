import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './ReviewerRegisterView.scss';

import { reviewerRegisterAction } from '../../store/actions/userReviewActions';

import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import LinkComp from '../../components/linkComp/LinkComp';
import { isValidEmail, isValidName, isValidPassword } from '../../utils/validation';

const ReviewerRegisterView = () => {
  const dispatch = useDispatch();

  const userReviewerRegistration = useSelector(
    (state) => state.userReviewerRegistration,
  );
  const { loading, error, success, userReviewerInfo } =
    userReviewerRegistration;

  const userId = useSelector((state) => state.userReviewId);
  const { userReviewId } = userId;

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
    if (userReviewerInfo && userReviewerInfo !== undefined) {
      const warn =
        userReviewerInfo.name +
        ' your profile is created.' +
        ' You will receive an email with a link asking to confirm your email address.' +
        ' You will need to confirm your email in order to login.';
      setRegistrationConfirmation(warn);
    }
  }, [userReviewerInfo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Contact form action
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      // Dispatch registration data
      dispatch(reviewerRegisterAction(name, email, password, userReviewId));
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      //divert to home page
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="reviewer-register-wrapper">
      {error ? <Message message={error} /> : null}
      {message ? <Message message={message} /> : null}
      {success ? <Message message={registrationConfirmation} variant="success" autoClose={5000} /> : null}

      {userReviewerInfo ? (
        <div className="reviewer-register-links">
          <LinkComp
            route="reviewer-login"
            routeName="Please login by clicking here"
          />
        </div>
      ) : !userReviewerInfo && loading ? (
        <LoadingSpinner />
      ) : (
        <fieldset className="fieldSet">
          <legend>
            Reviewer <span>Registration</span>
          </legend>
          <form onSubmit={handleSubmit} noValidate>
            <InputField
              id="reviewer-name"
              label="Name"
              value={name}
              hint="First and last name required"
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur('name')}
              type="text"
              name="name"
              required
              className={
                touched.name && !isValidName(name) && name.length > 0
                  ? 'invalid'
                  : name.length > 0
                  ? 'entered'
                  : ''
              }
              error={
                touched.name && !isValidName(name) && name.length !== 0
                  ? `Name field must start with an uppercase letter and contain at least 3 letters and have no white space.`
                  : null
              }
              aria-invalid={touched.name && !isValidName(name)}
            />

            <InputField
              id="reviewer-email"
              label="Email"
              type="email"
              name="email"
              value={email}
              required
              hint="Example: user@domain.com"
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
              id="reviewer-password"
              label="Password"
              type="password"
              name="password"
              value={password}
              required
              hint="Minimum 6 characters: 1 uppercase, 1 lowercase, 1 number, 1 special character"
              className={
                touched.password && !isValidPassword(password) && password.length > 0
                  ? 'invalid'
                  : password.length > 0
                  ? 'entered'
                  : ''
              }
              error={
                touched.password && !isValidPassword(password) && password.length !== 0
                  ? `Password must contain at least 1 Capital letter, 1 number and 1 special character.`
                  : null
              }
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              aria-invalid={touched.password && !isValidPassword(password)}
            />

            <InputField
              id="reviewer-confirm-password"
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              required
              hint="Must match the password above"
              className={
                touched.confirmPassword &&
                !isValidPassword(confirmPassword) &&
                confirmPassword.length > 0
                  ? 'invalid'
                  : confirmPassword.length > 0
                  ? 'entered'
                  : ''
              }
              error={
                touched.confirmPassword &&
                !isValidPassword(confirmPassword) &&
                confirmPassword.length !== 0
                  ? `Password must contain at least 1 Capital letter, 1 number and 1 special character.`
                  : null
              }
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              aria-invalid={
                touched.confirmPassword && !isValidPassword(confirmPassword)
              }
            />

            <Button
              
              text="Register"
              className="btn"
              disabled={
                !isValidName(name) ||
                !isValidPassword(password) ||
                !isValidPassword(confirmPassword) ||
                !isValidEmail(email)
              }
            ></Button>
          </form>
        </fieldset>
      )}
    </div>
  );
};

export default ReviewerRegisterView;
