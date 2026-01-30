import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './ForgotPassword.scss';
import { userForgotPasswordAction } from '../../store/actions/userActions';
import { isValidEmail } from '../../utils/validation';

import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import Message from '../../components/message/Message';

const ForgotPassword = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState({ email: false });

  const userForgotPassword = useSelector((state) => state.userForgotPassword);
  const { error, success } = userForgotPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch login
    dispatch(userForgotPasswordAction(email));
    setEmail('');
  };

  const handleBlur = () => {
    setTouched({ email: true });
  };

  return (
    <div className="forgot-password-wrapper">
      {error ? <Message message={error} variant="error" /> : null}
      {success ? (
        <Message
          message="If that email exists in our system, a password reset link has been sent. Please check your email and follow the instructions."
          variant="success"
        />
      ) : null}

      <fieldset className="fieldSet">
        <legend>
          Member <span>Forgot Password</span>
        </legend>
        <form onSubmit={handleSubmit}>
          <InputField
            id="forgot-password-email"
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

export default ForgotPassword;
