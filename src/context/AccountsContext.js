import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAccountId } from '../utils/recordIds';
import { getCompanies, createCompany as createCompanyApi, updateCompany as updateCompanyApi } from '../services/companyApi';

const AccountsContext = createContext(null);

export function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAccounts() {
      try {
        setLoading(true);
        const res = await getCompanies();
        if (isMounted) {
          const mapped = (res.data?.data || []).map((c) => ({
            ...c,
            id: c._id || c.id,
          }));
          setAccounts(mapped);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch companies in context:', err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchAccounts();
    return () => {
      isMounted = false;
    };
  }, []);

  const createAccount = async (accountData) => {
    try {
      const res = await createCompanyApi(accountData);
      const created = res.data?.data;
      if (created) {
        const mapped = { ...created, id: created._id || created.id };
        setAccounts((previous) => [mapped, ...previous]);
        return mapped;
      }
    } catch (err) {
      console.error('Error creating account in context:', err);
      throw err;
    }
  };

  const importAccounts = (newAccounts) => {
    const mapped = newAccounts.map((c) => ({ ...c, id: c._id || c.id }));
    setAccounts((previous) => [...mapped, ...previous]);
  };

  const updateAccount = async (accountId, updates) => {
    try {
      const res = await updateCompanyApi(accountId, updates);
      const updated = res.data?.data;
      if (updated) {
        const mapped = { ...updated, id: updated._id || updated.id };
        setAccounts((previous) =>
          previous.map((account) => (getAccountId(account) === accountId ? mapped : account)),
        );
        return mapped;
      }
    } catch (err) {
      console.error('Error updating account in context:', err);
      throw err;
    }
  };

  return (
    <AccountsContext.Provider value={{ accounts, loading, error, createAccount, importAccounts, updateAccount }}>
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