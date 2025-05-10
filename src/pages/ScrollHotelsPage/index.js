import React, { useRef, useEffect } from 'react';
import HotelCard from '../../components/HotelCard';
import Header from '../../components/Header';
import './styles.css';
import { usePaginatedHotels } from '../../hooks/usePaginatedHotels';

const ScrollHotelsPage = () => {
  const {
    hotels,
    hasMore,
    isLoading,
    nextPage,
  } = usePaginatedHotels(50);

  const loader = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading) {
          nextPage();
        }
      },
      {
        root: null,
        rootMargin: "100px",  // start loading before the bottom
        threshold: 1.0         // fully visible
      }
    );

    const currentLoader = loader.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, isLoading, nextPage]);

  return (
    <div>
      <Header />
      <div className="scroll-hotels">
        <h2>Infinite Scroll Hotels</h2>
        {hotels.map((hotel, idx) => (
          <HotelCard key={`${hotel.name}-${idx}`} hotel={hotel} />
        ))}
        {hotels.length > 0 && hasMore && !isLoading && (
          <div ref={loader} className="loading-trigger">
            Keep scrolling to load more hotels...
          </div>
        )}
        {!hasMore && <p className="end-of-list">You’ve reached the end.</p>}
      </div>
    </div>
  );
};

export default ScrollHotelsPage;
