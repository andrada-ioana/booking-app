import React, { useEffect } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HotelDescriptionPage from './pages/HotelDescriptionPage';
import UpdatePage from './pages/UpdatePage';
import { useState } from 'react';
import AddHotelPage from './pages/AddHotelPage/index.js';
import StatisticsPage from './pages/StatisticsPage/index.js';

function App() {
  const [hotels, setHotels] = useState([]);
  const [filters, setFilters] = useState([]);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/hotels')
      .then(res => res.json())
      .then(data => setHotels(data));

    fetch('http://localhost:3001/api/filters')
      .then(res => res.json())
      .then(data => setFilters(data));

    fetch('http://localhost:3001/api/facilities')
      .then(res => res.json())
      .then(data => setFacilities(data));

      const interval = setInterval(() => {
        fetch('http://localhost:3001/api/hotels/generate/5', {
          method: 'POST',
        })
          .then(() => fetch('http://localhost:3001/api/hotels'))
          .then(res => res.json())
          .then(data => setHotels(data))
          .catch(err => console.error("Error generating hotels:", err));
      }, 5000);

    return () => clearInterval(interval); 
  }, []);

  const handleAdd = async (newHotel) => {
    const response = await fetch('http://localhost:3001/api/hotels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHotel),
    });
    const added = await response.json();
    setHotels(prev => [...prev, added]);
  };

  const handleUpdate = async (updatedHotel) => {
    await fetch(`http://localhost:3001/api/hotels/${updatedHotel.name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedHotel),
    });
    setHotels(prev =>
      prev.map(h => (h.name === updatedHotel.name ? updatedHotel : h))
    );
  };

  const handleDelete = async (hotelName) => {
    await fetch(`http://localhost:3001/api/hotels/${hotelName}`, {
      method: 'DELETE',
    });
    setHotels(prev => prev.filter(h => h.name !== hotelName));
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<HomePage filtersList={filters} hotelsList={hotels} />}
        />
        <Route
          path="/hotel/:name"
          element={<HotelDescriptionPage hotels={hotels} onDelete={handleDelete} />}
        />
        <Route
          path="/update/:name"
          element={<UpdatePage hotels={hotels} onUpdate={handleUpdate} allFacilities={facilities} />}
        />
        <Route
          path="/add-hotel"
          element={<AddHotelPage hotels={hotels} onAdd={handleAdd} allFacilities={facilities} />}
        />
        <Route
          path="/view-statistics"
          element={<StatisticsPage hotelsList={hotels} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
