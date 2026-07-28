import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const DealsContext = createContext(null);

export function DealsProvider({ children }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/deals`);
      setDeals(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load deals in context:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const createDeal = async (payload) => {
    try {
      const res = await axios.post(`${API_BASE}/deals`, payload);
      const created = res.data?.data;
      if (created) {
        setDeals((current) => [created, ...current]);
        return created;
      }
    } catch (err) {
      console.error('Error creating deal in context:', err);
      throw err;
    }
  };

  const importDeals = async (rows) => {
    try {
      const res = await axios.post(`${API_BASE}/deals/bulk-import`, { rows });
      await fetchDeals(); // re-fetch rather than guess at inserted shape
      return res.data?.data; // { insertedCount, skippedCount, errors }
    } catch (err) {
      console.error('Error importing deals in context:', err);
      throw err;
    }
  };

  const updateDeal = async (updatedDeal) => {
    const id = updatedDeal._id || updatedDeal.id;
    if (!id) return;
    try {
      const res = await axios.put(`${API_BASE}/deals/${id}`, updatedDeal);
      const savedDeal = res.data?.data;
      if (savedDeal) {
        setDeals((current) => current.map((d) => (d._id === id ? savedDeal : d)));
        return savedDeal;
      }
    } catch (err) {
      console.error('Error updating deal in context:', err);
      throw err;
    }
  };

  const deleteDeal = async (id) => {
    try {
      await axios.delete(`${API_BASE}/deals/${id}`);
      setDeals((current) => current.filter((d) => d._id !== id));
    } catch (err) {
      console.error('Error deleting deal in context:', err);
      throw err;
    }
  };

  return (
    <DealsContext.Provider
      value={{
        deals,
        loading,
        error,
        createDeal,
        importDeals,
        updateDeal,
        deleteDeal,
        refetch: fetchDeals,
      }}
    >
      {children}
    </DealsContext.Provider>
  );
}

export function useDeals() {
  const context = useContext(DealsContext);
  if (!context) {
    throw new Error('useDeals must be used within a DealsProvider');
  }
  return context;
}
