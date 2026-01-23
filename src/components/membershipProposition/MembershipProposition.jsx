import PropTypes from 'prop-types';
import './MembershipProposition.scss';
import Button from '../button/Button';

const MembershipProposition = ({ onApplyClick }) => {
  return (
    <fieldset className="fieldSet membership-proposition">
      <legend>Membership</legend>

      <p className="hero-text">Professional recognition starts here.</p>

      <p className="intro-text">
        Professional recognition for individual practitioners in fitness,
        beauty, rehabilitation, and wellbeing.
      </p>

      {/* Pricing Section */}
      <section className="pricing-section">
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
        <Button
          text="Apply for Membership"
          onClick={onApplyClick}
          type="button"
          title="Proceed to membership application"
        />
        <p className="pricing-disclaimer">No contracts • Cancel anytime</p>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h3>What You Receive</h3>
        <ul className="detailed-list">
          <li>
            <strong>Verified professional status</strong>
            <span>Recognition as a Body Vantage professional following review and approval.</span>
          </li>
          <li>
            <strong>Structured professional profile</strong>
            <span>Designed to present your information consistently and responsibly.</span>
          </li>
          <li>
            <strong>Trust-led public visibility</strong>
            <span>Allowing the public to discover professionals through a platform focused on credibility.</span>
          </li>
          <li>
            <strong>Alignment with recognised standards</strong>
            <span>Membership confirms you meet Body Vantage standards for qualifications and conduct.</span>
          </li>
          <li>
            <strong>Ongoing professional support</strong>
            <span>Continued access to guidance and standards to support responsible representation.</span>
          </li>
        </ul>
      </section>

    </fieldset>
  );
};

MembershipProposition.propTypes = {
  onApplyClick: PropTypes.func.isRequired,
};

export default MembershipProposition;
