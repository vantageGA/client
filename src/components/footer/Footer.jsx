import React from 'react';
import './Footer.scss';
import DateTime from '../dateTime/DateTime';

const Footer = () => {
  const buildVersion = import.meta.env.VITE_BUILD_VERSION;
  const normalizedVersion = buildVersion ? buildVersion.trim() : '';
  let buildLabel = normalizedVersion;

  if (buildLabel) {
    const semverMatch = buildLabel.match(/^v?(\d+\.\d+\.\d+)(?:[-+](.+))?$/);

    if (semverMatch) {
      const baseVersion = semverMatch[1];
      const metaVersion = semverMatch[2];
      buildLabel = metaVersion
        ? `v${baseVersion} (${metaVersion})`
        : `v${baseVersion}`;
    } else if (!/^v/i.test(buildLabel) && /\d/.test(buildLabel)) {
      buildLabel = `v${buildLabel}`;
    }
  }

  return (
    <footer>
      <div className="footer-wrapper">
        <DateTime />
        {buildLabel ? (
          <div className="footer-build">Build {buildLabel}</div>
        ) : null}
        <div className="footer-copyright">
          Copyright &copy; {new Date().getFullYear()} Body-Vantage
        </div>
      </div>
    </footer>
  );
};

export default Footer;
