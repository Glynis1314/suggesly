import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { DealsProvider } from './context/DealsContext';
import { AccountsProvider } from './context/AccountsContext';
import { ContactsProvider } from './context/ContactsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AccountsProvider>
        <ContactsProvider>
          <DealsProvider>
            <App />
          </DealsProvider>
        </ContactsProvider>
      </AccountsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
