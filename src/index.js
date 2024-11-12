import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Remove React.StrictMode wrapper
  <App />
);

// Register the service worker for PWA functionality
serviceWorkerRegistration.register();

reportWebVitals();
