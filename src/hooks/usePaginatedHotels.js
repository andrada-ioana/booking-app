import { useState, useEffect, useCallback } from 'react';

export function usePaginatedHotels(pageSize) {
  const [hotels, setHotels] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPage = useCallback(async (newPage = 0) => {
    setIsLoading(true);
    const offset = newPage * pageSize;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/hotels?limit=${pageSize}&offset=${offset}`);
      const data = await res.json();

      setHotels(data);
      setHasMore(data.length === pageSize);
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Error fetching hotels:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  const nextPage = () => {
    if (hasMore && !isLoading) {
      fetchPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 0 && !isLoading) {
      fetchPage(page - 1);
    }
  };

  useEffect(() => {
    fetchPage(0);
  }, [fetchPage, pageSize]);

  return {
    hotels,
    page,
    hasMore,
    isLoading,
    nextPage,
    prevPage,
    fetchPage,
  };
}
