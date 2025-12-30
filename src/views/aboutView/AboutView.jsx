import './AboutView.scss';
import BodyVantage from '../../components/bodyVantage/BodyVantage';
import Button from '../../components/button/Button';
import LinkComp from '../../components/linkComp/LinkComp';

const AboutView = () => {
  return (
    <div className="about-wrapper">
      <fieldset className="fieldSet">
        <legend>About Us</legend>

        <p>
          <BodyVantage /> is a personal wellbeing website which enables you to
          search and connect with specialised and experienced wellbeing
          providers throughout the UK.
        </p>

        <p>
          I noticed a gap in the health and wellbeing industry, where there was
          a wealth of industry experience out there, but the public were not
          aware of the providers in their location and that there had to be a
          better way to put the public in touch with the right wellbeing
          providers.
        </p>

        <p>
          Ready to grow your wellbeing business and reach more clients? Join{' '}
          <BodyVantage /> today and take ownership of your industry profile.
        </p>

        <section className="member-benefits">
          <h3>As a registered <BodyVantage /> member you:</h3>
          <ul>
            <li>
              can showcase your business to the public and convert enquiries
              into clients
            </li>
            <li>can advertise your various wellbeing services to the public</li>
            <li>are allowed unlimited service updates</li>
            <li>can personalise your profile</li>
            <li>can add client reviews</li>
          </ul>
          <div className="cta-section">
            <Button
              text="Become a Member Today"
              colour="#BE4F0C"
              disabled={false}
              onClick={() => window.location.href = 'http://localhost:5173/registration'}
              type="button"
            />
          </div>
        </section>

        <section className="visitor-features">
          <h3><BodyVantage /> enables their visitors to search:</h3>
          <ul>
            <li>for vetted and recognised wellbeing members/providers</li>
            <li>in a location of their choice</li>
            <li>member wellbeing offerings and reviews</li>
            <li>for member contact details and make enquiries</li>
          </ul>
        </section>
      </fieldset>

      <div className="faq-link">
        <p>
          Got any questions? <LinkComp route="faq" routeName="View our FAQ" />
        </p>
      </div>
    </div>
  );
};

export default AboutView;
