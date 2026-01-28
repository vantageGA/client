import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getUserDetailsAction } from '../../store/actions/userActions';
import Button from '../../components/button/Button';
import './SubscriptionView.scss';

const SubscriptionSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Refresh user details to get subscription status
    dispatch(getUserDetailsAction());

    // Get session id from URL if present (for verification if needed)
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // Session ID available for verification if needed
    }
  }, [dispatch, searchParams]);

  return (
    <div className="subscription-wrapper">
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
