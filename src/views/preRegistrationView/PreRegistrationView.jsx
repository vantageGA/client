import './PreRegistrationView.scss';
import { useNavigate } from 'react-router-dom';
import BodyVantage from '../../components/bodyVantage/BodyVantage';
import Button from '../../components/button/Button';
import LinkComp from '../../components/linkComp/LinkComp';

const PreRegistrationView = () => {
  const navigate = useNavigate();

  return (
    <div className="pre-registration-wrapper">
      <fieldset className="fieldSet">
        <legend>Join <BodyVantage /> – Become a Registered Member</legend>

        <p className="intro-text">
          <BodyVantage /> membership is designed for individual professionals
          working across fitness, beauty, rehabilitation, and wellbeing. Whether
          you operate independently, are self-employed, or work as part of a
          wider team, membership recognises you as a professional, not a
          business listing.
        </p>

        <p>
          Joining <BodyVantage /> confirms your commitment to verified
          expertise, professional conduct, and recognised standards.
        </p>

        {/* Who Membership Is For Section */}
        <section className="content-section">
          <h3>Who Membership Is For</h3>
          <p>
            <BodyVantage /> supports individual practitioners including:
          </p>
          <ul>
            <li>Personal trainers and fitness professionals</li>
            <li>Beauticians and aesthetics practitioners</li>
            <li>Physiotherapists and rehabilitation specialists</li>
            <li>Massage therapists and chiropractors</li>
            <li>Wellbeing and holistic practitioners</li>
          </ul>
          <p>
            Membership is open to professionals who value credibility,
            accountability, and long-term trust over visibility alone.
          </p>
        </section>

        {/* Why Join Section */}
        <section className="benefits-section">
          <h3>Why Join <BodyVantage /></h3>
          <p>As a registered member, you benefit from:</p>
          <ul className="detailed-list">
            <li>
              <strong>Individual professional recognition</strong>
              <span>
                Membership confirms that you meet <BodyVantage />{' '}
                standards for qualifications, conduct, and professional
                alignment.
              </span>
            </li>
            <li>
              <strong>Increased client confidence</strong>
              <span>
                Being a registered member helps potential clients feel reassured
                before making contact.
              </span>
            </li>
            <li>
              <strong>Clear, professional representation</strong>
              <span>
                Your profile is structured to communicate your expertise
                accurately, without reliance on marketing language or
                self-promotion.
              </span>
            </li>
            <li>
              <strong>Alignment with a trusted network</strong>
              <span>
                Join a recognised community of professionals committed to
                maintaining standards within their industry.
              </span>
            </li>
          </ul>
        </section>

        {/* What Membership Includes Section */}
        <section className="includes-section">
          <h3>What Membership Includes</h3>
          <p>Registered members receive:</p>
          <ul className="detailed-list">
            <li>
              <strong>Verified member status</strong>
              <span>
                Recognition as a <BodyVantage /> professional following review
                and approval.
              </span>
            </li>
            <li>
              <strong>Structured professional profile</strong>
              <span>
                Designed to present your information consistently and
                responsibly.
              </span>
            </li>
            <li>
              <strong>Trust-led visibility</strong>
              <span>
                Allowing the public to discover professionals through a platform
                focused on credibility, not popularity.
              </span>
            </li>
            <li>
              <strong>Ongoing professional alignment</strong>
              <span>
                Continued access to guidance and standards to support
                responsible representation.
              </span>
            </li>
          </ul>
        </section>

        {/* How to Become a Member Section */}
        <section className="timeline-section">
          <h3>How to Become a Registered Member</h3>
          <div className="timeline-container">
            <div className="timeline-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <strong>Apply as an individual professional</strong>
                <p>
                  Submit your personal details, qualifications, and professional
                  information.
                </p>
              </div>
            </div>
            <div className="timeline-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <strong>Verification and review</strong>
                <p>
                  Your application is reviewed to ensure <BodyVantage />{' '}
                  standards are met.
                </p>
              </div>
            </div>
            <div className="timeline-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <strong>Approval and registration</strong>
                <p>
                  Once approved, your profile is activated and you become a
                  registered <BodyVantage /> member.
                </p>
              </div>
            </div>
            <div className="timeline-step">
              <span className="step-number">4</span>
              <div className="step-content">
                <strong>Maintain standards</strong>
                <p>
                  Membership requires ongoing adherence to professional
                  guidelines and responsible representation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="commitment-section">
          <h3>Our Commitment to Members and the Public</h3>
          <p>
            <BodyVantage /> exists to recognise individual professionals, not
            promote businesses or practices. Our focus is on trust, credibility,
            and professional accountability, helping members and the public
            engage with confidence.
          </p>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-buttons">
            <Button
              text="Register Now"
              disabled={false}
              onClick={() => navigate('/registration')}
              type="button"
              title="Proceed to registration"
            />
            <Button
              text="Back to About"
              disabled={false}
              onClick={() => navigate('/about')}
              type="button"
              title="Return to about page"
            />
          </div>
        </section>
      </fieldset>

      <div className="support-link">
        <p>
          Need help?{' '}
          <LinkComp route="contact" routeName="Contact Support" /> or{' '}
          <LinkComp route="faq" routeName="Browse FAQs" />
        </p>
      </div>
    </div>
  );
};

export default PreRegistrationView;
