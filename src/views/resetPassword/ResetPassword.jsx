import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './ResetPassword.scss';

import Message from '../../components/message/Message';
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import LinkComp from '../../components/linkComp/LinkComp';
import PasswordStrength from '../../components/passwordStrength/PasswordStrength';

import { updateUserPasswordAction } from '../../store/actions/userActions';
import { isValidPassword } from '../../utils/validation';

const ResetPassword = () => {
  const params = useParams();
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);

  const userUpdatePassword = useSelector((state) => state.userUpdatePassword);
  const { success, error, message: SuccessMessage } = userUpdatePassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      // Dispatch registration data
      dispatch(
        updateUserPasswordAction({
          resetPasswordToken: params.token,
          password: password,
        }),
      );
      setMessage(null);
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="reset-pw-wrapper">
      {message ? <Message message={message} /> : null}
      {success ? (
        <>
          <Message message={SuccessMessage} variant="success" autoClose={5000} />
          <LinkComp route="login" routeName="Navigate to login form" />
        </>
      ) : (
        <fieldset className="fieldSet">
          <legend>
            Members <span>Reset Password</span> form
          </legend>
          <form onSubmit={handleSubmit}>
            <InputField
              label="Password"
              type="password"
              name={password}
              value={password}
              required
              className={!isValidPassword(password) && password.length > 0 ? 'invalid' : password.length > 0 ? 'entered' : ''}
              onChange={(e) => setPassword(e.target.value)}
            />

            {password.length > 0 && <PasswordStrength password={password} />}

            <InputField
              label="Confirm Password"
              type="password"
              name={confirmPassword}
              value={confirmPassword}
              required
              className={
                !isValidPassword(confirmPassword) && confirmPassword.length > 0
                  ? 'invalid'
                  : confirmPassword.length > 0
                  ? 'entered'
                  : ''
              }
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              
              text="submit"
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
      {success}
    </div>
  );
};

export default ResetPassword;
