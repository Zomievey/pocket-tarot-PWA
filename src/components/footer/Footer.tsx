import React from "react";
import "./FooterStyles.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className='footerContainer'>
      <p className='footerText'>
        © {currentYear} Pocket Tarot. All Rights Reserved.{" "}
        <a
          href='https://zomievey.github.io/pocket-tarot-support/'
          className='contactLink'
          target='_blank'
          rel='noopener noreferrer'
        >
          Contact Us | FAQ
        </a>
      </p>
    </div>
  );
}
