import React, { useEffect } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HotelDescriptionPage from './pages/HotelDescriptionPage';
import UpdatePage from './pages/UpdatePage';
import { useState } from 'react';
import AddHotelPage from './pages/AddHotelPage/index.js';
import StatisticsPage from './pages/StatisticsPage/index.js';
import { useOfflineSync } from './hooks/useOfflineSync.js';
import ScrollHotelsPage from './pages/ScrollHotelsPage'

function App() {
  const [hotels, setHotels] = useState([]);
  const [filters, setFilters] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const { isOnline, isServerUp, queueOperation } = useOfflineSync();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/hotels`)
      .then(res => res.json())
      .then(data => setHotels(data))
      .catch(err => console.error("API Error:", err));

    fetch(`${process.env.REACT_APP_API_URL}/api/filters`)
      .then(res => res.json())
      .then(data => setFilters(data))
      .catch(err => console.error("API Error:", err));
      

    fetch(`${process.env.REACT_APP_API_URL}/api/facilities`)
      .then(res => res.json())
      .then(data => setFacilities(data))
      .catch(err => console.error("API Error:", err));

      const interval = setInterval(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/hotels/generate/5`, {
          method: 'POST',
        })
          .then(() => fetch(`${process.env.REACT_APP_API_URL}/api/hotels`))
          .then(res => res.json())
          .then(data => setHotels(data))
          .catch(err => console.error("Error generating hotels:", err));
      }, 5000);

    return () => clearInterval(interval); 
  }, []);

  const handleAdd = async (newHotel) => {
    if (!isOnline || !isServerUp) {
      queueOperation("POST", newHotel);
      return;
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/hotels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHotel),
    });
    const added = await response.json();
    setHotels(prev => [...prev, added]);
  };

  const handleUpdate = async (updatedHotel) => {
    if (!isOnline || !isServerUp) {
      queueOperation("PUT", updatedHotel, `/${updatedHotel.name}`);
      return;
    }
    await fetch(`${process.env.REACT_APP_API_URL}/api/hotels/${updatedHotel.name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedHotel),
    });
    setHotels(prev =>
      prev.map(h => (h.name === updatedHotel.name ? updatedHotel : h))
    );
  };

  const handleDelete = async (hotelName) => {
    if (!isOnline || !isServerUp) {
      queueOperation("DELETE", {}, `/${hotelName}`);
      return;
    }
    await fetch(`${process.env.REACT_APP_API_URL}/api/hotels/${hotelName}`, {
      method: 'DELETE',
    });
    setHotels(prev => prev.filter(h => h.name !== hotelName));
  };

  return (
    <Router>
      {!isOnline && <div className="network-alert">You're offline!</div>}
      {isOnline && !isServerUp && <div className="network-alert">Server is down!</div>}
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
        <Route
          path="/scroll-hotels"
          element={<ScrollHotelsPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
