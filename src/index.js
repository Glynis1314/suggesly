import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { DealsProvider } from './context/DealsContext';
import { AccountsProvider } from './context/AccountsContext';
import { ContactsProvider } from './context/ContactsContext';
import { TasksProvider } from './context/TasksContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AccountsProvider>
        <ContactsProvider>
          <DealsProvider>
            <TasksProvider>
              <App />
            </TasksProvider>
          </DealsProvider>
        </ContactsProvider>
      </AccountsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
