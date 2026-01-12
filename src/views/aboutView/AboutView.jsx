import './AboutView.scss';
import { useNavigate } from 'react-router-dom';
import BodyVantage from '../../components/bodyVantage/BodyVantage';
import Button from '../../components/button/Button';
import LinkComp from '../../components/linkComp/LinkComp';

const AboutView = () => {
  const navigate = useNavigate();
  return (
    <div className="about-wrapper">
      <fieldset className="fieldSet">
        <legend>About Us</legend>

        <p>
          <BodyVantage /> was created to support professionals in the fitness,
          beauty, rehabilitation, and wellbeing industries who genuinely care
          about the people they work with. I work with businesses that help
          others look better, move better, and feel better — from personal
          trainers and gym owners to hair and beauty specialists, physios,
          massage therapists, chiropractors, and wellbeing practitioners.
        </p>

        <p>
          I understand that your audience is looking for more than just a
          service. They want expertise they can trust, clear communication, and
          a brand that feels credible and relatable. Through <BodyVantage />, I
          help you express who you are, what you offer, and why it matters — so
          you can connect with the right clients and grow your business with
          confidence.
        </p>

        <p>
          <BodyVantage /> is here to help you stand out, connect authentically,
          and build a brand you're proud of.
        </p>

        <section className="member-benefits">
          <h3>As a <BodyVantage /> member you can:</h3>
          <ul>
            <li>Strengthen your professional presence and credibility</li>
            <li>Communicate your services with clarity and confidence</li>
            <li>Connect more effectively with your ideal audience</li>
            <li>Support sustainable business growth</li>
          </ul>
          <div className="cta-section">
            <Button
              text="Become a Member Today"
              colour="#C4A523"
              disabled={false}
              onClick={() => navigate('/registration')}
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
