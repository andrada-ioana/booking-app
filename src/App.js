import React, { useEffect, useRef } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HotelDescriptionPage from './pages/HotelDescriptionPage';
import UpdatePage from './pages/UpdatePage';
import { useState } from 'react';
import AddHotelPage from './pages/AddHotelPage/index.js';
import StatisticsPage from './pages/StatisticsPage/index.js';
import { useOfflineSync } from './hooks/useOfflineSync.js';
import ScrollHotelsPage from './pages/ScrollHotelsPage'
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [filters, setFilters] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const generatorIntervalRef = useRef(null);
  const { isOnline, isServerUp, queueOperation } = useOfflineSync();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const PAGE_SIZE = 50;
  const baseUrl = process.env.REACT_APP_API_URL || '';

  const fetchHotelByName = async (name) => {
    try {
      const res = await fetch(`${baseUrl}/api/hotels/${name}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) throw new Error('Hotel not found');
      const data = await res.json();
      setSelectedHotel(data);
    } catch (err) {
      console.error("Error fetching hotel by name:", err);
      setSelectedHotel(null);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch filters
        const filtersRes = await fetch(`${baseUrl}/api/filters`);
        if (!filtersRes.ok) throw new Error('Failed to fetch filters');
        const filtersData = await filtersRes.json();
        setFilters(filtersData);

        // Fetch facilities
        const facilitiesRes = await fetch(`${baseUrl}/api/facilities`);
        if (!facilitiesRes.ok) throw new Error('Failed to fetch facilities');
        const facilitiesData = await facilitiesRes.json();
        setFacilities(facilitiesData);
      } catch (err) {
        console.error("Error fetching initial data:", err);
      }
    };

    fetchInitialData();
  }, [baseUrl]);

  useEffect(() => {
    if (isGenerating) {
      generatorIntervalRef.current = setInterval(async () => {
        try {
          await fetch(`${baseUrl}/api/hotels/generate/1`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });

          const hotelsRes = await fetch(`${baseUrl}/api/hotels`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (!hotelsRes.ok) throw new Error('Failed to fetch hotels');
          const hotelsData = await hotelsRes.json();
          setHotels(hotelsData);
        } catch (err) {
          console.error("Error generating hotels:", err);
        }
      }, 5000);
    } else {
      clearInterval(generatorIntervalRef.current);
    }

    return () => clearInterval(generatorIntervalRef.current);
  }, [isGenerating, baseUrl]);

  const toggleGeneration = () => {
    setIsGenerating(prev => !prev);
  };

  const handleAdd = async (newHotel) => {
    if (!isOnline || !isServerUp) {
      queueOperation("POST", newHotel);
      return;
    }

    const { videoFile, ...hotelData } = newHotel;

    try {
      const response = await fetch(`${baseUrl}/api/hotels`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newHotel),
      });

      if (!response.ok) throw new Error('Failed to add hotel');
      const addedHotel = await response.json();

      if (videoFile) {
        const videoForm = new FormData();
        videoForm.append("video", videoFile);

        const uploadResponse = await fetch(`${baseUrl}/api/hotels/${addedHotel.name}/video`, {
          method: 'POST',
          body: videoForm,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (uploadResponse.ok) {
          const { video_url } = await uploadResponse.json();
          addedHotel.video_url = video_url;
        }
      }

      setHotels(prev => [...prev, addedHotel]);
    } catch (err) {
      console.error("Error adding hotel:", err);
    }
  };

  const handleUpdate = async (updatedHotel) => {
    if (!isOnline || !isServerUp) {
      queueOperation("PUT", updatedHotel, `/${updatedHotel.name}`);
      return;
    }

    const { videoFile, video_url, video, ...hotelData } = updatedHotel;

    try {
      if (!videoFile) {
        hotelData.video = video;
        hotelData.video_url = video_url;
      } else {
        hotelData.video = "";
        hotelData.video_url = "";
      }

      const res = await fetch(`${baseUrl}/api/hotels/${updatedHotel.name}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(hotelData),
      });

      if (!res.ok) throw new Error('Failed to update hotel');
      const savedHotel = await res.json();

      if (videoFile) {
        const videoForm = new FormData();
        videoForm.append("video", videoFile);

        const videoRes = await fetch(`${baseUrl}/api/hotels/${updatedHotel.name}/video`, {
          method: 'POST',
          body: videoForm,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (videoRes.ok) {
          const { video_url } = await videoRes.json();
          savedHotel.video_url = video_url;
        }
      }

      setHotels(prev =>
        prev.map(h => (h.name === savedHotel.name ? savedHotel : h))
      );
    } catch (err) {
      console.error("Error updating hotel:", err);
    }
  };

  const handleDelete = async (hotelName) => {
    if (!isOnline || !isServerUp) {
      queueOperation("DELETE", {}, `/${hotelName}`);
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/hotels/${hotelName}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete hotel');
      setHotels(prev => prev.filter(h => h.name !== hotelName));
    } catch (err) {
      console.error("Error deleting hotel:", err);
    }
  };

  return (
    <Router>
      {!isOnline && <div className="network-alert">You're offline!</div>}
      {isOnline && !isServerUp && <div className="network-alert">Server is down!</div>}
      
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <LoginPage />} />
        <Route path="/home" element={<HomePage filtersList={filters} isGenerating={isGenerating} toggleGeneration={toggleGeneration} />} />
        <Route path="/hotel/:name" element={<HotelDescriptionPage selectedHotel={selectedHotel} fetchHotelByName={fetchHotelByName} onDelete={handleDelete} />} />
        <Route path="/update/:name" element={<UpdatePage selectedHotel={selectedHotel} fetchHotelByName={fetchHotelByName} onUpdate={handleUpdate} allFacilities={facilities} />} />
        <Route path="/add-hotel" element={<AddHotelPage hotels={hotels} onAdd={handleAdd} allFacilities={facilities} />} />
        <Route path="/view-statistics" element={<StatisticsPage hotelsList={hotels} />} />
        <Route path="/scroll-hotels" element={<ScrollHotelsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
