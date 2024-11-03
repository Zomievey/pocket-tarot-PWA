import React from 'react';
import './FooterStyles.css'; // Assuming you have a CSS file for styles

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
