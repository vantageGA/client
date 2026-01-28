import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCheckoutSessionAction } from '../../store/actions/stripeActions';
import Button from '../../components/button/Button';
import Message from '../../components/message/Message';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import './SubscriptionView.scss';

const SubscriptionOptions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { loading } = useSelector((state) => state.stripeCheckout);
  const { userInfo } = useSelector((state) => state.userLogin);

  // Redirect to registration if user is not logged in
  useEffect(() => {
    if (!userInfo) {
      navigate('/registration');
    }
  }, [userInfo, navigate]);

  const handleSubscribe = async (plan) => {
    if (!userInfo) {
      navigate('/registration');
      return;
    }

    try {
      setError(null);
      const userData = {
        plan,
        email: userInfo.email,
        name: userInfo.name
      };
      await dispatch(createCheckoutSessionAction(userData));
    } catch (err) {
      setError(err.message);
    }
  };

  // Don't render if not logged in (will redirect)
  if (!userInfo) {
    return null;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="subscription-wrapper">
      {error && <Message message={error} variant="error" />}

      <fieldset className="fieldSet">
        <legend>Choose Your Subscription</legend>

        <p className="intro-text">
          Select a membership plan to unlock your professional profile on Body Vantage.
        </p>

        <div className="plan-options">
          <div className="plan-card">
            <h3>Monthly Plan</h3>
            <p className="price">
              <span className="amount">£9.99</span>
              <span className="period">/month</span>
            </p>
            <ul className="features">
              <li>Full access to all features</li>
              <li>Cancel anytime</li>
              <li>No long-term commitment</li>
            </ul>
            <Button
              text="Subscribe Monthly"
              onClick={() => handleSubscribe('monthly')}
              disabled={loading}
              type="button"
            />
          </div>

          <div className="plan-card featured">
            <span className="badge">Best Value</span>
            <h3>Annual Plan</h3>
            <p className="price">
              <span className="amount">£99</span>
              <span className="period">/year</span>
            </p>
            <p className="savings">Save 20% compared to monthly</p>
            <ul className="features">
              <li>Full access to all features</li>
              <li>Cancel anytime</li>
              <li>2 months free</li>
            </ul>
            <Button
              text="Subscribe Annually"
              onClick={() => handleSubscribe('annual')}
              disabled={loading}
              type="button"
            />
          </div>
        </div>

        <p className="disclaimer">
          Secure payment powered by Stripe. Cancel anytime from your account settings.
        </p>
      </fieldset>
    </div>
  );
};

export default SubscriptionOptions;
