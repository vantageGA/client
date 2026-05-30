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
    <main className="forgot-password-wrapper">
      {error ? <Message message={error} variant="error" /> : null}
      {success ? (
        <Message
          message="If that email exists in our system, a password reset link has been sent. Please check your email and follow the instructions."
          variant="success"
        />
      ) : null}

      <article className="forgot-password-panel" aria-labelledby="forgot-password-title">
        <header className="forgot-password-hero">
          <p className="forgot-password-kicker">Password</p>
          <h1 id="forgot-password-title">
            Member <span>Forgot Password</span>
          </h1>
        </header>

        <div className="forgot-password-layout">
          <section className="forgot-password-context" aria-label="Password reset guidance">
            <div className="section-heading">
              <span>01</span>
              <h2>Reset Access</h2>
            </div>
            <p>
              Enter the email address connected to your member account. If it
              matches an account, we will send password reset instructions.
            </p>
          </section>

          <section className="forgot-password-form-panel" aria-label="Password reset form">
            <div className="section-heading">
              <span>02</span>
              <h2>Registered Email</h2>
            </div>

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
                autoFocus
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
                type="submit"
                text="Send reset link"
                className="btn"
                disabled={!isValidEmail(email)}
              ></Button>
            </form>
          </section>
        </div>
      </article>
    </main>
  );
};

export default ForgotPassword;
