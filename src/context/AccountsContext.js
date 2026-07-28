import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const AccountsContext = createContext(null);

export function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/companies`);
      setAccounts(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load companies in context:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const createAccount = async (payload) => {
    try {
      const res = await axios.post(`${API_BASE}/companies`, payload);
      const created = res.data?.data;
      if (created) {
        setAccounts((current) => [created, ...current]);
        return created;
      }
    } catch (err) {
      console.error('Error creating company in context:', err);
      throw err;
    }
  };

  const importAccounts = async (rows) => {
    try {
      const res = await axios.post(`${API_BASE}/companies/bulk-import`, { rows });
      await fetchAccounts(); // re-fetch rather than guess at inserted shape
      return res.data?.data; // { insertedCount, skippedCount, errors }
    } catch (err) {
      console.error('Error importing companies in context:', err);
      throw err;
    }
  };

  const updateAccount = async (id, updates) => {
    try {
      const res = await axios.put(`${API_BASE}/companies/${id}`, updates);
      const updated = res.data?.data;
      if (updated) {
        setAccounts((current) => current.map((a) => (a._id === id ? updated : a)));
        return updated;
      }
    } catch (err) {
      console.error('Error updating company in context:', err);
      throw err;
    }
  };

  const deleteAccount = async (id) => {
    try {
      await axios.delete(`${API_BASE}/companies/${id}`);
      setAccounts((current) => current.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Error deleting company in context:', err);
      throw err;
    }
  };

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        loading,
        error,
        createAccount,
        importAccounts,
        updateAccount,
        deleteAccount,
        refetch: fetchAccounts,
      }}
    >
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