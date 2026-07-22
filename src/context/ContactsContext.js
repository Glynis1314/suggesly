import React, { createContext, useContext, useState, useEffect } from 'react';
import { getContactId } from '../utils/recordIds';
import { getContacts, createContact as createContactApi, updateContact as updateContactApi } from '../services/contactApi';

const ContactsContext = createContext(null);

export function ContactsProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchContacts() {
      try {
        setLoading(true);
        const res = await getContacts();
        if (isMounted) {
          const mapped = (res.data?.data || []).map((c) => ({
            ...c,
            id: c._id || c.id,
          }));
          setContacts(mapped);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch contacts in context:', err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchContacts();
    return () => {
      isMounted = false;
    };
  }, []);

  const createContact = async (contactData) => {
    try {
      const res = await createContactApi(contactData);
      const created = res.data?.data;
      if (created) {
        const mapped = { ...created, id: created._id || created.id };
        setContacts((previous) => [mapped, ...previous]);
        return mapped;
      }
    } catch (err) {
      console.error('Error creating contact in context:', err);
      throw err;
    }
  };

  const importContacts = (newContacts) => {
    const mapped = newContacts.map((c) => ({ ...c, id: c._id || c.id }));
    setContacts((previous) => [...mapped, ...previous]);
  };

  const updateContact = async (contactId, updates) => {
    try {
      const res = await updateContactApi(contactId, updates);
      const updated = res.data?.data;
      if (updated) {
        const mapped = { ...updated, id: updated._id || updated.id };
        setContacts((previous) =>
          previous.map((contact) => (getContactId(contact) === contactId ? mapped : contact)),
        );
        return mapped;
      }
    } catch (err) {
      console.error('Error updating contact in context:', err);
      throw err;
    }
  };

  return (
    <ContactsContext.Provider value={{ contacts, loading, error, createContact, importContacts, updateContact }}>
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