import React, { useRef } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HotelDescriptionPage from './pages/HotelDescriptionPage';
import Service from './service/service.js';
import UpdatePage from './pages/UpdatePage';
import Repository from './repository/repository.js';
import { useState } from 'react';
import AddHotelPage from './pages/AddHotelPage/index.js';

function App() {
  const repo = new Repository();
  const service = new Service(repo);
  const [hotels, setHotels] = useState(service.getHotelsList());
  const facilities = service.getFacilitiesList();

  const handleUpdate = (updatedHotel) => {
    const updatedHotels = hotels.map(hotel => 
      hotel.name === updatedHotel.name ? updatedHotel : hotel
    );
    setHotels(updatedHotels);
    repo.setHotelsList(updatedHotels);
  };

  const handleDelete = (hotelName) => {
    const updatedHotels = hotels.filter(hotel => hotel.name !== hotelName);
    setHotels(updatedHotels);
    repo.setHotelsList(updatedHotels);
  };

  const handleAdd = (newHotel) => {
    const updatedHotels = [...hotels, newHotel];
    setHotels(updatedHotels);
    repo.setHotelsList(updatedHotels);  
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage filtersList={service.getFiltersList()} hotelsList={hotels} />} />
        <Route path="/hotel/:name" element={<HotelDescriptionPage hotels={hotels} onDelete={handleDelete} />} />
        <Route path="/update/:name" element={<UpdatePage hotels={hotels} onUpdate={handleUpdate} allFacilities={facilities} />} />
        <Route path="/add-hotel" element={<AddHotelPage hotels={hotels} onAdd={handleAdd} allFacilities={facilities} />} />
      </Routes>
    </Router>
  );
}

export default App;
