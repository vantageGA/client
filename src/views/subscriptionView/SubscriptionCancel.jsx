import { useNavigate } from 'react-router-dom';
import Button from '../../components/button/Button';
import './SubscriptionView.scss';

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="subscription-wrapper">
      <fieldset className="fieldSet cancel-fieldset">
        <legend>Subscription Cancelled</legend>

        <div className="cancel-icon" aria-hidden="true">
          &#10007;
        </div>

        <h2>Payment Cancelled</h2>
        <p className="intro-text">
          Your subscription process was cancelled. No payment has been taken.
        </p>
        <p>
          If you experienced any issues or have questions, please don't hesitate to contact us.
        </p>

        <div className="cta-section">
          <Button
            text="Try Again"
            onClick={() => navigate('/registration')}
            type="button"
          />
          <Button
            text="Back to Home"
            onClick={() => navigate('/')}
            type="button"
          />
        </div>
      </fieldset>
    </div>
  );
};

export default SubscriptionCancel;
