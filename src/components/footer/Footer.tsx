import React from 'react';
import './FooterStyles.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footerContainer">
      <p className="footerText">
        © {currentYear} Pocket Tarot. All Rights Reserved.
      </p>
    </div>
  );
}
