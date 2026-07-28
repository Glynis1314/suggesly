import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';

const ContactsContext = createContext(null);

export function ContactsProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/contacts');
      setContacts(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load contacts in context:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = async (payload) => {
    try {
      const res = await axiosInstance.post('/contacts', payload);
      const created = res.data?.data;
      if (created) {
        setContacts((current) => [created, ...current]);
        return created;
      }
    } catch (err) {
      console.error('Error creating contact in context:', err);
      throw err;
    }
  };

  const importContacts = async (rows) => {
    try {
      const res = await axiosInstance.post('/contacts/bulk-import', { rows });
      await fetchContacts(); // re-fetch rather than guess at inserted shape
      return res.data?.data; // { insertedCount, skippedCount, errors }
    } catch (err) {
      console.error('Error importing contacts in context:', err);
      throw err;
    }
  };

  const updateContact = async (id, updates) => {
    try {
      const res = await axiosInstance.put(`/contacts/${id}`, updates);
      const updated = res.data?.data;
      if (updated) {
        setContacts((current) => current.map((c) => (c._id === id ? updated : c)));
        return updated;
      }
    } catch (err) {
      console.error('Error updating contact in context:', err);
      throw err;
    }
  };

  const deleteContact = async (id) => {
    try {
      await axiosInstance.delete(`/contacts/${id}`);
      setContacts((current) => current.filter((c) => c._id !== id));
    } catch (err) {
      console.error('Error deleting contact in context:', err);
      throw err;
    }
  };

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        loading,
        error,
        createContact,
        importContacts,
        updateContact,
        deleteContact,
        refetch: fetchContacts,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
}