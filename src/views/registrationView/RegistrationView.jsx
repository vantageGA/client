import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './RegistrationView.scss';

import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import { registerAction } from '../../store/actions/userActions';

const RegistrationView = () => {
  const nameRegEx = /^[a-zA-Z\s'-]{2,}\s+[a-zA-Z\s'-]{2,}$/;
  const emailRegEx =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  const passwordRegEx =
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"£$%^&*()#~@])[A-Za-z\d!"£$%^&*()#~@]{6,}$/;
  const passwordConfirmRegEx =
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"£$%^&*()#~@])[A-Za-z\d!"£$%^&*()#~@]{6,}$/;

  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  return (
    <div className="registrationView-wrapper">
      {error ? <Message message={error} /> : null}
      {message ? <Message message={message} /> : null}
      {success ? <Message message={registrationConfirmation} success /> : null}

      {!userInfo && loading ? (
        <LoadingSpinner />
      ) : (
        <fieldset className="fieldSet">
          <legend>Members Registration form</legend>
          <form onSubmit={handleSubmit} noValidate>
            <InputField
              label="Name"
              placeholder="Ben Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur('name')}
              type="text"
              name="name"
              required
              className={
                touched.name && !nameRegEx.test(name) && name.length > 0
                  ? 'invalid'
                  : name.length > 0
                  ? 'entered'
                  : ''
              }
              error={
                touched.name && !nameRegEx.test(name) && name.length !== 0
                  ? `Please enter your full name (first and last name).`
                  : null
              }
              aria-invalid={touched.name && !nameRegEx.test(name)}
            />

            <InputField
              label="Email"
              type="email"
              name={email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              className={
                touched.email && !emailRegEx.test(email) && email.length > 0
                  ? 'invalid'
                  : email.length > 0
                  ? 'entered'
                  : ''
              }
              error={
                touched.email && !emailRegEx.test(email) && email.length !== 0
                  ? `Invalid email address.`
                  : null
              }
              aria-invalid={touched.email && !emailRegEx.test(email)}
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
                !passwordRegEx.test(password) &&
                password.length > 0
                  ? 'invalid'
                  : password.length > 0
                  ? 'entered'
                  : ''
              }
              error={
                touched.password &&
                !passwordRegEx.test(password) &&
                password.length !== 0
                  ? `Password must contain at least 1 capital letter, 1 number and 1 special character.`
                  : null
              }
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={touched.password && !passwordRegEx.test(password)}
            />

            <InputField
              label="Confirm Password"
              type="password"
              name={confirmPassword}
              value={confirmPassword}
              required
              onBlur={() => handleBlur('confirmPassword')}
              className={
                touched.confirmPassword &&
                !passwordConfirmRegEx.test(confirmPassword) &&
                confirmPassword.length > 0
                  ? 'invalid'
                  : confirmPassword.length > 0
                  ? 'entered'
                  : ''
              }
              error={
                touched.confirmPassword &&
                !passwordConfirmRegEx.test(confirmPassword) &&
                confirmPassword.length !== 0
                  ? `Password must contain at least 1 capital letter, 1 number and 1 special character.`
                  : null
              }
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={
                touched.confirmPassword &&
                !passwordConfirmRegEx.test(confirmPassword)
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
              colour="transparent"
              text="submit"
              className="btn"
              disabled={
                !nameRegEx.test(name) ||
                !passwordRegEx.test(password) ||
                !passwordConfirmRegEx.test(confirmPassword) ||
                !emailRegEx.test(email)
              }
            ></Button>
          </form>
        </fieldset>
      )}
    </div>
  );
};

export default RegistrationView;
