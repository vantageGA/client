import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyCheckoutSessionAction } from '../../store/actions/stripeActions';
import { getUserDetailsAction } from '../../store/actions/userActions';
import Button from '../../components/button/Button';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import './SubscriptionView.scss';

const SubscriptionSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifying, error } = useSelector((state) => state.stripeCheckout);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      dispatch(verifyCheckoutSessionAction(sessionId));
    } else {
      dispatch(getUserDetailsAction());
    }
  }, [dispatch, searchParams]);

  return (
    <div className="subscription-wrapper">
      {verifying ? <LoadingSpinner /> : null}
      {error ? <Message message={error} variant="error" /> : null}

      <fieldset className="fieldSet success-fieldset">
        <legend>Subscription Successful</legend>

        <div className="success-icon" aria-hidden="true">
          &#10003;
        </div>

        <h2>Welcome to Body Vantage</h2>
        <p className="intro-text">
          Thank you for subscribing. Your membership is now active.
        </p>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>Create your professional profile</li>
            <li>Upload your qualifications</li>
            <li>Start receiving reviews</li>
            <li>Connect with other professionals</li>
          </ul>
        </div>

        <div className="cta-section">
          <Button
            text="Create Your Profile"
            onClick={() => navigate('/profile-edit')}
            type="button"
          />
        </div>
      </fieldset>
    </div>
  );
};

export default SubscriptionSuccess;
