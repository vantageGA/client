import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/seo/PageMeta';
import BodyVantage from '../../components/bodyVantage/BodyVantage';
import Button from '../../components/button/Button';
import logo from '../../assets/logo/logo.svg';
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
      <article className="sector-panel" aria-labelledby="sector-title">
        <header className="sector-hero">
          <div>
            <p className="sector-kicker">Verified Sector</p>
            <h1 id="sector-title">{sector.heading}</h1>
          </div>
        </header>

        <div className="sector-intro">
          <p>
          <BodyVantage /> is a UK professional verification platform for people
          who want clear, credible information before choosing a practitioner.
          {` ${sector.intro}`}
          </p>
        </div>

        <div className="sector-sections">
          <section className="content-section">
            <div className="section-heading">
              <span>01</span>
              <h2>Who This Supports</h2>
            </div>
            <div className="section-copy">
              <ul>
                {sector.audience.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="content-section content-section-feature">
            <div className="section-heading">
              <span>02</span>
              <h2>How Verification Helps</h2>
            </div>
            <div className="section-copy">
              <p>
                Profiles on <BodyVantage /> are structured around professional
                information clients can understand: qualifications, specialisms,
                location, reviews, and contact details. This keeps the focus on
                trust and suitability rather than paid promotion.
              </p>
            </div>
          </section>

          <section className="content-section cta-section">
            <div className="section-heading">
              <span>03</span>
              <h2>Next Step</h2>
            </div>
            <div className="section-copy cta-copy">
              <img src={logo} alt="" aria-hidden="true" />
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
          </section>
        </div>
      </article>
    </main>
  );
};

SectorLandingView.propTypes = {
  sectorSlug: PropTypes.string.isRequired,
};

export default SectorLandingView;
