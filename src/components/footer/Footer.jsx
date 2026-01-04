import React from 'react';
import './Footer.scss';
import DateTime from '../dateTime/DateTime';

const Footer = () => {
  return (
    <footer>
      <div className="footer-wrapper">
        <DateTime />
        <div className="footer-copyright">
          Copyright &copy; {new Date().getFullYear()} Body-Vantage
        </div>
      </div>
    </footer>
  );
};

export default Footer;
