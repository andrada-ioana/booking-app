import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import HotelCharts from '../../components/HotelCharts';
import './styles.css';
import { useSocket } from '../../hooks/useSocket';

const StatisticsPage = ({ hotelsList }) => {
  const [hotels, setHotels] = useState(hotelsList || []);

  // Handle real-time updates via socket
  useSocket((newHotel) => {
    setHotels((prevHotels) => [...prevHotels, newHotel]);
  });

  useEffect(() => {
    setHotels(hotelsList); // Ensure hotels are initialized if passed from props
  }, [hotelsList]);

  return (
    <div>
      <Header />
      <HotelCharts hotelsList={hotels} styles="body-position" />
    </div>
  );
};

export default StatisticsPage;
