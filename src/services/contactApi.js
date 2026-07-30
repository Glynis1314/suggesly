import axiosInstance from './axiosInstance';
import { CONTACTS, COMPANIES } from './endpoints';

/**
 * Fetch a list of contacts based on optional query parameters.
 * @param {Object} [params] - Query parameters (e.g., page, limit, sort).
 * @returns {Promise<Object>} The Axios response promise.
 */
export const getContacts = async (params) => {
  try {
    return await axiosInstance.get(CONTACTS, { params });
  } catch (error) {
    console.error('Error in getContacts API call:', error);
    throw error;
  }
};

/**
 * Fetch a specific contact by its ID.
 * @param {string|number} id - The ID of the contact to retrieve.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const getContactById = async (id) => {
  try {
    return await axiosInstance.get(`${CONTACTS}/${id}`);
  } catch (error) {
    console.error(`Error in getContactById API call for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new contact.
 * @param {Object} data - The contact data to create.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const createContact = async (data) => {
  try {
    return await axiosInstance.post(CONTACTS, data);
  } catch (error) {
    console.error('Error in createContact API call:', error);
    throw error;
  }
};

/**
 * Update an existing contact by its ID.
 * @param {string|number} id - The ID of the contact to update.
 * @param {Object} data - The updated contact data.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const updateContact = async (id, data) => {
  try {
    return await axiosInstance.put(`${CONTACTS}/${id}`, data);
  } catch (error) {
    console.error(`Error in updateContact API call for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a contact by its ID.
 * @param {string|number} id - The ID of the contact to delete.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const deleteContact = async (id) => {
  try {
    return await axiosInstance.delete(`${CONTACTS}/${id}`);
  } catch (error) {
    console.error(`Error in deleteContact API call for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Search contacts by query text.
 * @param {string} query - The search query term.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const searchContacts = async (query) => {
  try {
    return await axiosInstance.get(CONTACTS, { params: { q: query } });
  } catch (error) {
    console.error(`Error in searchContacts API call with query "${query}":`, error);
    throw error;
  }
};

/**
 * Filter contacts by specified filter criteria.
 * @param {Object} filters - Key-value pairs representing active filter criteria.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const filterContacts = async (filters) => {
  try {
    return await axiosInstance.get(CONTACTS, { params: filters });
  } catch (error) {
    console.error('Error in filterContacts API call:', error);
    throw error;
  }
};

/**
 * Fetch contacts associated with a specific company.
 * Uses a nested RESTful resource route.
 * @param {string|number} companyId - The ID of the company.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const getContactsByCompany = async (companyId) => {
  try {
    return await axiosInstance.get(`${COMPANIES}/${companyId}/contacts`);
  } catch (error) {
    console.error(`Error in getContactsByCompany API call for company ID ${companyId}:`, error);
    throw error;
  }
};

export const bulkUpdateContacts = async (ids, updates) => {
  try {
    return await axiosInstance.patch(`${CONTACTS}/bulk-update`, { ids, updates });
  } catch (error) {
    console.error('Error in bulkUpdateContacts API call:', error);
    throw error;
  }
};

export const bulkDeleteContacts = async (ids) => {
  try {
    return await axiosInstance.delete(`${CONTACTS}/bulk-delete`, { data: { ids } });
  } catch (error) {
    console.error('Error in bulkDeleteContacts API call:', error);
    throw error;
  }
};
