import React, { useEffect, useState, useRef } from 'react';
import HotelCard from '../../components/HotelCard';
import Header from '../../components/Header';
import './styles.css';

const PAGE_SIZE = 10;

const ScrollHotelsPage = () => {
const [hotels, setHotels] = useState([]);
const [allHotels, setAllHotels] = useState([]);
const [index, setIndex] = useState(0);
const loader = useRef(null);

useEffect(() => {
    if (allHotels.length > 0 && hotels.length === 0) {
      setHotels(allHotels.slice(0, PAGE_SIZE));
      setIndex(PAGE_SIZE);
    }
  }, [allHotels, hotels.length]);
  
// Poll the server for updates every 5 seconds
useEffect(() => {
    const fetchHotels = async () => {
    try {
        const res = await fetch('http://localhost:3001/api/hotels');
        const data = await res.json();

        // Only update if something changed (basic length check or more advanced logic)
        if (data.length !== allHotels.length) {
        setAllHotels(data);
        }
    } catch (err) {
        console.error('Error fetching hotels:', err);
    }
    };

    // Fetch immediately, then every 5 seconds
    fetchHotels();
    const interval = setInterval(fetchHotels, 5000);

    return () => clearInterval(interval);
}, [allHotels]);
  

  // Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && allHotels.length > 0) {
        const nextHotels = [];

        for (let i = 0; i < PAGE_SIZE; i++) {
          const nextIndex = (index + i) % allHotels.length;
          nextHotels.push(allHotels[nextIndex]);
        }

        setHotels(prev => [...prev, ...nextHotels]);
        setIndex((prev) => (prev + PAGE_SIZE) % allHotels.length);
      }
    });

    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [index, allHotels]);

  return (
    <div>
      <Header />
      <div className="scroll-hotels">
        <h2>Infinite Scroll Hotels (Looping)</h2>
        {hotels.map((hotel, idx) => (
          <HotelCard key={`${hotel.name}-${idx}`} hotel={hotel} />
        ))}
        <div ref={loader} className="loading-trigger">
          Keep scrolling to see more hotels...
        </div>
      </div>
    </div>
  );
};

export default ScrollHotelsPage;
