import React, { createContext, useContext, useState } from 'react';
import { accountsRows } from '../data/accountsData';
import { getAccountId } from '../utils/recordIds';

const AccountsContext = createContext(null);

export function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState(accountsRows);

  const createAccount = (account) => {
    setAccounts((previous) => [account, ...previous]);
  };

  const importAccounts = (newAccounts) => {
    setAccounts((previous) => [...newAccounts, ...previous]);
  };

  const updateAccount = (accountId, updates) => {
    setAccounts((previous) =>
      previous.map((account) => (getAccountId(account) === accountId ? { ...account, ...updates } : account)),
    );
  };

  return (
    <AccountsContext.Provider value={{ accounts, createAccount, importAccounts, updateAccount }}>
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
}