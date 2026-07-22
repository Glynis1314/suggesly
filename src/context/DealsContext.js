import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDeals, createDeal as createDealApi, updateDeal as updateDealApi } from '../services/dealApi';

const DealsContext = createContext(null);

export function DealsProvider({ children }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDeals() {
      try {
        setLoading(true);
        const res = await getDeals();
        if (isMounted) {
          const mapped = (res.data?.data || []).map((d) => ({
            ...d,
            id: d._id || d.id,
          }));
          setDeals(mapped);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch deals in context:', err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchDeals();
    return () => {
      isMounted = false;
    };
  }, []);

  const createDeal = async (dealData) => {
    try {
      const res = await createDealApi(dealData);
      const created = res.data?.data;
      if (created) {
        const mapped = { ...created, id: created._id || created.id };
        setDeals((previousDeals) => [mapped, ...previousDeals]);
        return mapped;
      }
    } catch (err) {
      console.error('Error creating deal in context:', err);
      throw err;
    }
  };

  const updateDeal = async (updatedDeal) => {
    const id = updatedDeal.id || updatedDeal._id;
    if (!id) return;
    try {
      const res = await updateDealApi(id, updatedDeal);
      const savedDeal = res.data?.data;
      if (savedDeal) {
        const mapped = { ...savedDeal, id: savedDeal._id || savedDeal.id };
        setDeals((previousDeals) =>
          previousDeals.map((deal) =>
            (deal.id === id || deal._id === id) ? mapped : deal
          ),
        );
        return mapped;
      }
    } catch (err) {
      console.error('Error updating deal in context:', err);
      throw err;
    }
  };

  return (
    <DealsContext.Provider value={{ deals, loading, error, createDeal, updateDeal }}>
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
