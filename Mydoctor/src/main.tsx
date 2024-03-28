import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// console.log(import.meta.env); // Log environment variables
import './main.css';
await import('katex/dist/katex.min.css');

import './i18n';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
