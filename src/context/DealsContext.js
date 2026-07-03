import React, { createContext, useContext, useState } from 'react';
import { mockDeals } from '../data/mockDeals';

const DealsContext = createContext(null);

export function DealsProvider({ children }) {
  const [deals, setDeals] = useState(mockDeals);

  const createDeal = (deal) => {
    setDeals((previousDeals) => [deal, ...previousDeals]);
  };

  const updateDeal = (updatedDeal) => {
    setDeals((previousDeals) =>
      previousDeals.map((deal) => (deal.id === updatedDeal.id ? updatedDeal : deal)),
    );
  };

  return (
    <DealsContext.Provider value={{ deals, createDeal, updateDeal }}>
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
