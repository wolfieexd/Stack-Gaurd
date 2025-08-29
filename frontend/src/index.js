import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// Polyfills for Stacks authentication
import { Buffer } from 'buffer';
import process from 'process';

// Set global Buffer for browser environment
window.Buffer = Buffer;
window.process = process;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
