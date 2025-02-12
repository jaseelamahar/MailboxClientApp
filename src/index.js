import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/* React Bootstrap configuration */
import 'react-bootstrap/dist/react-bootstrap.min.js';  // Minified version for better performance
import 'bootstrap/dist/css/bootstrap.min.css';        // Minified Bootstrap CSS for optimal size

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



