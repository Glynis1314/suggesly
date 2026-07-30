import axiosInstance from './axiosInstance';
import { DEALS } from './endpoints';

/**
 * Fetch a list of deals based on optional query parameters.
 * @param {Object} [params] - Query parameters (e.g., page, limit, sort).
 * @returns {Promise<Object>} The Axios response promise.
 */
export const getDeals = async (params) => {
  try {
    return await axiosInstance.get(DEALS, { params });
  } catch (error) {
    console.error('Error in getDeals API call:', error);
    throw error;
  }
};

/**
 * Fetch a specific deal by its ID.
 * @param {string|number} id - The ID of the deal to retrieve.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const getDealById = async (id) => {
  try {
    return await axiosInstance.get(`${DEALS}/${id}`);
  } catch (error) {
    console.error(`Error in getDealById API call for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new deal.
 * @param {Object} data - The deal data to create.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const createDeal = async (data) => {
  try {
    return await axiosInstance.post(DEALS, data);
  } catch (error) {
    console.error('Error in createDeal API call:', error);
    throw error;
  }
};

/**
 * Update an existing deal by its ID.
 * @param {string|number} id - The ID of the deal to update.
 * @param {Object} data - The updated deal data.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const updateDeal = async (id, data) => {
  try {
    return await axiosInstance.put(`${DEALS}/${id}`, data);
  } catch (error) {
    console.error(`Error in updateDeal API call for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a deal by its ID.
 * @param {string|number} id - The ID of the deal to delete.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const deleteDeal = async (id) => {
  try {
    return await axiosInstance.delete(`${DEALS}/${id}`);
  } catch (error) {
    console.error(`Error in deleteDeal API call for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Move a deal to a different stage.
 * @param {string|number} id - The ID of the deal.
 * @param {string} stage - The new stage for the deal.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const moveDealStage = async (id, stage) => {
  try {
    return await axiosInstance.patch(`${DEALS}/${id}/stage`, { stage });
  } catch (error) {
    console.error(`Error in moveDealStage API call for ID ${id} to stage "${stage}":`, error);
    throw error;
  }
};

/**
 * Assign a deal to a user.
 * @param {string|number} id - The ID of the deal.
 * @param {string|number} userId - The ID of the user to assign the deal to.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const assignDeal = async (id, userId) => {
  try {
    return await axiosInstance.patch(`${DEALS}/${id}/assign`, { userId });
  } catch (error) {
    console.error(`Error in assignDeal API call for ID ${id} to user "${userId}":`, error);
    throw error;
  }
};

/**
 * Search deals by query text.
 * @param {string} query - The search query term.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const searchDeals = async (query) => {
  try {
    return await axiosInstance.get(DEALS, { params: { q: query } });
  } catch (error) {
    console.error(`Error in searchDeals API call with query "${query}":`, error);
    throw error;
  }
};

/**
 * Filter deals by specified filter criteria.
 * @param {Object} filters - Key-value pairs representing active filter criteria.
 * @returns {Promise<Object>} The Axios response promise.
 */
export const filterDeals = async (filters) => {
  try {
    return await axiosInstance.get(DEALS, { params: filters });
  } catch (error) {
    console.error('Error in filterDeals API call:', error);
    throw error;
  }
};

export const bulkUpdateDeals = async (ids, updates) => {
  try {
    return await axiosInstance.patch(`${DEALS}/bulk-update`, { ids, updates });
  } catch (error) {
    console.error('Error in bulkUpdateDeals API call:', error);
    throw error;
  }
};

export const bulkDeleteDeals = async (ids) => {
  try {
    return await axiosInstance.delete(`${DEALS}/bulk-delete`, { data: { ids } });
  } catch (error) {
    console.error('Error in bulkDeleteDeals API call:', error);
    throw error;
  }
};
