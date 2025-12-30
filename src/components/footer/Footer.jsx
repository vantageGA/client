import React from 'react';
import './Footer.scss';
import DateTime from '../dateTime/DateTime';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-wrapper">
        <DateTime />
        <div className="footer-copyright">CopyRight &copy; Body-Vantage</div>
      </div>
    </footer>
  );
};

export default Footer;
