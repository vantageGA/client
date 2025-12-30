import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import LinkComp from '../../components/linkComp/LinkComp';
import { loginAction } from '../../store/actions/userActions';
import './LoginFormView.scss';

const LoginFormView = () => {
  const navigate = useNavigate();

  const passwordRegEx = /([^\s])/;
  const emailRegEx =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  useEffect(() => {
    if (userInfo && userInfo !== undefined) {
      navigate('/user-profile-edit');
    }
  }, [userInfo, navigate]);

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
      {error ? <Message message={error} /> : null}
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
                touched.email && email.length > 0 && !emailRegEx.test(email)
                  ? 'invalid'
                  : email.length > 0
                  ? 'entered'
                  : ''
              }
              error={
                touched.email &&
                !emailRegEx.test(email) &&
                email.length !== 0
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
                touched.password && !password.length
                  ? 'invalid'
                  : password.length > 0
                  ? 'entered'
                  : ''
              }
              error={
                touched.password &&
                !passwordRegEx.test(password) &&
                password.length !== 0
                  ? `Password cannot be empty`
                  : null
              }
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={touched.password && !passwordRegEx.test(password)}
            />

            <Button
              colour="transparent"
              text="submit"
              className="btn"
              disabled={!password.length || !emailRegEx.test(email)}
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
