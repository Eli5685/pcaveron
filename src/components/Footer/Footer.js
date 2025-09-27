import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/about')) {
    return null;
  }
  return (
    <footer className="app-footer" role="contentinfo" aria-label="Footer">
      <div className="footer-inner">
        <Link to="/about" className="footer-link" aria-label="О нас">О нас</Link>
        <span className="footer-sep">•</span>
        <span className="footer-text">© {new Date().getFullYear()} Averon. Все права защищены.</span>
      </div>
    </footer>
  );
};

export default Footer;

