import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/seo/PageMeta';
import BodyVantage from '../../components/bodyVantage/BodyVantage';
import Button from '../../components/button/Button';
import {
  buildBreadcrumbJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from '../../config/seo';
import sectorPages from './sectorPages';
import './SectorLandingView.scss';

const SectorLandingView = ({ sectorSlug }) => {
  const navigate = useNavigate();
  const sector = sectorPages[sectorSlug];

  if (!sector) {
    return null;
  }

  return (
    <main className="sector-landing-wrapper">
      <PageMeta
        title={sector.title}
        description={sector.description}
        canonicalPath={sector.path}
        jsonLd={[
          organizationJsonLd,
          websiteJsonLd,
          buildBreadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: sector.heading, path: sector.path },
          ]),
        ]}
      />
      <fieldset className="fieldSet">
        <legend>{sector.heading}</legend>

        <p>
          <BodyVantage /> is a UK professional verification platform for people
          who want clear, credible information before choosing a practitioner.
          {` ${sector.intro}`}
        </p>

        <div className="content-section">
          <h3>Who This Supports</h3>
          <ul>
            {sector.audience.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="content-section">
          <h3>How Verification Helps</h3>
          <p>
            Profiles on <BodyVantage /> are structured around professional
            information clients can understand: qualifications, specialisms,
            location, reviews, and contact details. This keeps the focus on
            trust and suitability rather than paid promotion.
          </p>
        </div>

        <div className="cta-section">
          <div className="cta-buttons">
            <Button
              type="button"
              text="Find Professionals"
              disabled={false}
              onClick={() => navigate('/')}
              title="Search verified professionals"
            />
            <Button
              type="button"
              text="Register as a Professional"
              disabled={false}
              onClick={() => navigate('/pre-registration')}
              title="Register with Body Vantage"
            />
          </div>
        </div>
      </fieldset>
    </main>
  );
};

SectorLandingView.propTypes = {
  sectorSlug: PropTypes.string.isRequired,
};

export default SectorLandingView;
