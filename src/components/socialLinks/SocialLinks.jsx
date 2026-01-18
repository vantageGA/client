import React from 'react';
import './SocialLinks.scss';

const SOCIAL_LINKS_CONFIG = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/company/bodyvantage/',
    ariaLabel: 'Visit BodyVantage on LinkedIn',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    url: 'https://www.instagram.com/bodyvantage/',
    ariaLabel: 'Visit BodyVantage on Instagram',
  },
  {
    id: 'facebook-f',
    label: 'Facebook',
    url: 'https://www.facebook.com/bodyvantage/',
    ariaLabel: 'Visit BodyVantage on Facebook',
  },
];

const SocialLinks = ({ socials = SOCIAL_LINKS_CONFIG }) => {
  return (
    <div className="social-links-section">
      <h3 className="social-heading">Follow Us</h3>
      <div className="social-links-container">
        {socials.map((social) => (
          <a
            key={social.id}
            href={social.url}
            aria-label={social.ariaLabel}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <i className={`fab fa-${social.id}`} aria-hidden="true"></i>
            <span className="social-label">{social.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialLinks;
