import { useState, useEffect } from 'react';

export function usePagination(items, resetDeps = [], initialCount = 30, step = 30) {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  useEffect(() => {
    setVisibleCount(initialCount);
  }, resetDeps); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + step, items.length));
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      loadMore();
    }
  };

  return {
    visibleCount,
    loadMore,
    handleScroll,
  };
}
