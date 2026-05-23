import './AboutView.scss';
import { useNavigate } from 'react-router-dom';
import BodyVantage from '../../components/bodyVantage/BodyVantage';
import Button from '../../components/button/Button';
import LinkComp from '../../components/linkComp/LinkComp';
import PageMeta from '../../components/seo/PageMeta';
import { buildBreadcrumbJsonLd, organizationJsonLd } from '../../config/seo';

const AboutView = () => {
  const navigate = useNavigate();
  return (
    <main className="about-wrapper">
      <PageMeta
        title="Professional Verification Platform UK | Body Vantage"
        description="Learn why Body Vantage verifies fitness, beauty, hair, barber, and wellbeing professionals across the UK to support trust and industry standards."
        canonicalPath="/about"
        jsonLd={[
          organizationJsonLd,
          buildBreadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ]}
      />
      <article className="about-panel" aria-labelledby="about-title">
        <header className="about-hero">
          <p className="about-kicker">Info</p>
          <h1 id="about-title">
            About <BodyVantage />
          </h1>
        </header>

        <div className="about-intro">
          <p>
            <BodyVantage /> exists to help professionals in fitness, beauty,
            rehabilitation, and wellbeing present their professional expertise
            with clarity, credibility, and verified professionalism. Clients
            aren't just choosing a service, they are placing confidence in a
            practitioner. How a professional is represented matters, and{' '}
            <BodyVantage /> ensures that confidence is grounded in real standards,
            not marketing claims.
          </p>
        </div>

        <div className="about-sections">
          <section className="content-section">
            <div className="section-heading">
              <span>01</span>
              <h2>Why <BodyVantage /> Exists</h2>
            </div>
            <div className="section-copy">
              <p>
                Finding a trusted professional can be overwhelming. Credentials
                are hard to verify, and marketing often overshadows expertise.
              </p>
              <p>
                <BodyVantage /> bridges that gap. We support professionals who want
                to be recognised for their qualifications, conduct, and professional
                standards, while helping the public make informed decisions with
                confidence. Every member listed has been vetted to ensure they meet
                our requirements for credibility and professional alignment.
              </p>
            </div>
          </section>

          <section className="content-section">
            <div className="section-heading">
              <span>02</span>
              <h2>Who We Work With</h2>
            </div>
            <div className="section-copy">
              <p>
                <BodyVantage /> supports professionals across sectors where trust is
                essential:
              </p>
              <ul>
                <li>Fitness and personal training</li>
                <li>Hairdressing and barbering</li>
                <li>Beauty and aesthetics</li>
                <li>Rehabilitation and physical therapy</li>
                <li>Massage, chiropractic, and manual therapies</li>
                <li>Wellbeing and holistic practices</li>
              </ul>
              <p>
                Our members are dedicated professionals who value verified
                recognition, accountability, and long-term standards above
                visibility alone.
              </p>
            </div>
          </section>

          <section className="content-section content-section-feature">
            <div className="section-heading">
              <span>03</span>
              <h2>What It Means to Be a <BodyVantage /> Member</h2>
            </div>
            <div className="section-copy">
              <p>
                As a registered member, professionals join a verified network that
                focuses on:
              </p>
              <ul>
                <li>
                  Professional recognition — membership confirms adherence to
                  standards and verified expertise.
                </li>
                <li>
                  Clear, consistent representation — information is presented
                  accurately and professionally, without reliance on marketing
                  claims or self-promotion.
                </li>
                <li>
                  Trust-led connection — public profiles are structured to build
                  confidence before first contact, ensuring safer and more reliable
                  client engagement.
                </li>
              </ul>
              <p className="emphasis">
                <BodyVantage /> is not about popularity or ratings.
                <br />
                It is about clarity, credibility, and professional alignment.
              </p>
              <div className="cta-section">
                <Button
                  text="Become a Member Today"
                  disabled={false}
                  onClick={() => navigate('/pre-registration')}
                  type="button"
                  title="Learn more about membership"
                />
              </div>
            </div>
          </section>

          <section className="content-section">
            <div className="section-heading">
              <span>04</span>
              <h2>Our Approach</h2>
            </div>
            <div className="section-copy">
              <p>
                We believe trust is earned through verification, transparency, and
                accountability.
              </p>
              <p>
                This philosophy shapes every part of <BodyVantage /> — from how we
                vet and represent professionals, to how members maintain their
                profiles, to how the public interacts with the platform. Every
                feature exists to support informed, confident decisions.
              </p>
              <div className="cta-section">
                <Button
                  text="FAQs"
                  disabled={false}
                  onClick={() => navigate('/faq')}
                  type="button"
                />
              </div>
            </div>
          </section>
        </div>
      </article>

      <div className="support-link">
        <p>
          Got any questions? <LinkComp route="faq" routeName="View our FAQ" />
        </p>
      </div>
    </main>
  );
};

export default AboutView;
