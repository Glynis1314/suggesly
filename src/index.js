import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { DealsProvider } from './context/DealsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <DealsProvider>
        <App />
      </DealsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
