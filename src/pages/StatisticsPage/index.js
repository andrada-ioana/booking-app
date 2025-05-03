import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import HotelCharts from '../../components/HotelCharts';
import './styles.css';
import { useSocket } from '../../hooks/useSocket';

const StatisticsPage = ({ hotelsList = [] }) => {
  const [hotels, setHotels] = useState(hotelsList || []);

  // Handle real-time updates via socket
  useSocket((newHotel) => {
    setHotels((prevHotels) => [...prevHotels, newHotel]);
  });

  useEffect(() => {
    setHotels(Array.isArray(hotelsList) ? hotelsList : []);
  }, [hotelsList]);  

  return (
    <div>
      <Header />
      <HotelCharts hotelsList={hotels} styles="body-position" />
    </div>
  );
};

export default StatisticsPage;
