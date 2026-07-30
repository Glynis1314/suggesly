import axiosInstance from './axiosInstance';
import { COMPANIES } from './endpoints';

/**
 * Fetch a list of companies based on optional query parameters.
 * @param {Object} [params] - Query parameters (e.g., page, limit, sort).
 * @returns {Promise<Object>} The Axios response promise.
 */
export const getCompanies = async (params) => {
  try {
    return await axiosInstance.get(COMPANIES, { params });
  } catch (error) {
    console.error('Error in getCompanies API call:', error);
    throw error;
  }
};

/**
 * Fetch a specific company by its ID.
 * @param {string|number} id - The ID of the company to retrieve.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const getCompanyById = async (id) => {
  try {
    return await axiosInstance.get(`${COMPANIES}/${id}`);
  } catch (error) {
    console.error(`Error in getCompanyById API call for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new company.
 * @param {Object} data - The company data to create.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const createCompany = async (data) => {
  try {
    return await axiosInstance.post(COMPANIES, data);
  } catch (error) {
    console.error('Error in createCompany API call:', error);
    throw error;
  }
};

/**
 * Update an existing company by its ID.
 * @param {string|number} id - The ID of the company to update.
 * @param {Object} data - The updated company data.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const updateCompany = async (id, data) => {
  try {
    return await axiosInstance.put(`${COMPANIES}/${id}`, data);
  } catch (error) {
    console.error(`Error in updateCompany API call for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a company by its ID.
 * @param {string|number} id - The ID of the company to delete.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const deleteCompany = async (id) => {
  try {
    return await axiosInstance.delete(`${COMPANIES}/${id}`);
  } catch (error) {
    console.error(`Error in deleteCompany API call for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Search companies by query text.
 * @param {string} query - The search query term.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const searchCompanies = async (query) => {
  try {
    return await axiosInstance.get(COMPANIES, { params: { q: query } });
  } catch (error) {
    console.error(`Error in searchCompanies API call with query "${query}":`, error);
    throw error;
  }
};

/**
 * Filter companies by specified filter criteria.
 * @param {Object} filters - Key-value pairs representing active filter criteria.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const filterCompanies = async (filters) => {
  try {
    return await axiosInstance.get(COMPANIES, { params: filters });
  } catch (error) {
    console.error('Error in filterCompanies API call:', error);
    throw error;
  }
};

/**
 * Archive a company by its ID.
 * @param {string|number} id - The ID of the company to archive.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const archiveCompany = async (id) => {
  try {
    return await axiosInstance.patch(`${COMPANIES}/${id}/archive`);
  } catch (error) {
    console.error(`Error in archiveCompany API call for ID ${id}:`, error);
    throw error;
  }
};

export const bulkUpdateCompanies = async (ids, updates) => {
  try {
    return await axiosInstance.patch(`${COMPANIES}/bulk-update`, { ids, updates });
  } catch (error) {
    console.error('Error in bulkUpdateCompanies API call:', error);
    throw error;
  }
};

export const bulkDeleteCompanies = async (ids) => {
  try {
    return await axiosInstance.delete(`${COMPANIES}/bulk-delete`, { data: { ids } });
  } catch (error) {
    console.error('Error in bulkDeleteCompanies API call:', error);
    throw error;
  }
};
