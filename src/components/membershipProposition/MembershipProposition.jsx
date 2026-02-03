import PropTypes from 'prop-types';
import './MembershipProposition.scss';
import Button from '../button/Button';
import { useNavigate } from 'react-router-dom';

const MembershipProposition = ({ onApplyClick, showSubscriptionLink = false }) => {
  const navigate = useNavigate();

  const handleSubscriptionClick = () => {
    navigate('/subscribe');
  };

  return (
    <div className="membership-proposition">
      <div className="content-section">
        <h3>Professional Recognition Starts Here</h3>
        <p>
          Professional recognition for individual practitioners in fitness,
          beauty, rehabilitation, and wellbeing.
        </p>
      </div>

      <section className="content-section pricing-section">
        <h3>Membership Pricing</h3>
        <div className="pricing-options">
          <div className="price-item">
            <span className="price-amount">£9.99</span>
            <span className="price-period">per month</span>
          </div>
          <span className="price-divider" aria-hidden="true">
            or
          </span>
          <div className="price-item">
            <span className="price-amount">£99</span>
            <span className="price-period">per year</span>
          </div>
        </div>
        {showSubscriptionLink ? (
          <Button
            text="Subscribe Now"
            onClick={handleSubscriptionClick}
            type="button"
            title="Proceed to subscription"
          />
        ) : (
          <Button
            text="Apply for Membership"
            onClick={onApplyClick}
            type="button"
            title="Proceed to membership application"
          />
        )}
        <p className="pricing-disclaimer">No contracts • Cancel anytime</p>
      </section>

      <section className="content-section benefits-section">
        <h3>What You Receive</h3>
        <ul className="detailed-list">
          <li>
            Verified professional status — Recognition as a Body Vantage professional following review and approval.
          </li>
          <li>
            Structured professional profile — Designed to present your information consistently and responsibly.
          </li>
          <li>
            Trust-led public visibility — Allowing the public to discover professionals through a platform focused on credibility.
          </li>
          <li>
            Alignment with recognised standards — Membership confirms you meet Body Vantage standards for qualifications and conduct.
          </li>
          <li>
            Ongoing professional support — Continued access to guidance and standards to support responsible representation.
          </li>
        </ul>
      </section>
    </div>
  );
};

MembershipProposition.propTypes = {
  onApplyClick: PropTypes.func,
  showSubscriptionLink: PropTypes.bool,
};

export default MembershipProposition;
