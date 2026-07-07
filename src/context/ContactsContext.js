import React, { createContext, useContext, useState } from 'react';
import { contactsRows } from '../data/contactsData';
import { getContactId } from '../utils/recordIds';

const ContactsContext = createContext(null);

export function ContactsProvider({ children }) {
  const [contacts, setContacts] = useState(contactsRows);

  const createContact = (contact) => {
    setContacts((previous) => [contact, ...previous]);
  };

  const importContacts = (newContacts) => {
    setContacts((previous) => [...newContacts, ...previous]);
  };

  const updateContact = (contactId, updates) => {
    setContacts((previous) =>
      previous.map((contact) => (getContactId(contact) === contactId ? { ...contact, ...updates } : contact)),
    );
  };

  return (
    <ContactsContext.Provider value={{ contacts, createContact, importContacts, updateContact }}>
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