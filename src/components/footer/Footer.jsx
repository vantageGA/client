import React from 'react';
import './Footer.scss';
import DateTime from '../dateTime/DateTime';

const formatBuildVersion = (value) => {
  const normalizedVersion = value ? value.trim() : '';
  let buildLabel = normalizedVersion;

  if (!buildLabel) {
    return '';
  }

  const parts = buildLabel.split('-');
  if (parts.length >= 3) {
    const shortSha = parts.pop();
    const runNumber = parts.pop();
    const tagPart = parts.join('-');
    const cleanTag = tagPart.replace(/^v/i, '');
    return `v${cleanTag} - ${runNumber} - ${shortSha}`;
  }

  const semverMatch = buildLabel.match(/^v?(\d+\.\d+\.\d+)(?:[-+](.+))?$/);

  if (semverMatch) {
    const baseVersion = semverMatch[1];
    const metaVersion = semverMatch[2];
    return metaVersion ? `v${baseVersion} (${metaVersion})` : `v${baseVersion}`;
  }

  if (!/^v/i.test(buildLabel) && /\d/.test(buildLabel)) {
    buildLabel = `v${buildLabel}`;
  }

  return buildLabel;
};

const Footer = () => {
  const buildVersion = import.meta.env.VITE_BUILD_VERSION;
  const buildTimestamp = import.meta.env.VITE_BUILD_TIMESTAMP;
  const buildLabel = formatBuildVersion(buildVersion);
  const buildDetails = [buildLabel, buildTimestamp?.trim()].filter(Boolean).join(' | ');

  return (
    <footer>
      <div className="footer-wrapper">
        <DateTime />
        {buildDetails ? (
          <div className="footer-build">Build {buildDetails}</div>
        ) : null}
        <div className="footer-copyright">
          Copyright &copy; {new Date().getFullYear()} Body-Vantage
        </div>
      </div>
    </footer>
  );
};

export default Footer;
