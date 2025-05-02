import React, { useEffect, useRef } from 'react';
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

  const [isGenerating, setIsGenerating] = useState(false);
  const generatorIntervalRef = useRef(null);

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
  }, []);

  useEffect(() => {
    if (isGenerating) {
      generatorIntervalRef.current = setInterval(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/hotels/generate/1`, {
          method: 'POST',
        })
          .then(() => fetch(`${process.env.REACT_APP_API_URL}/api/hotels`))
          .then(res => res.json())
          .then(data => setHotels(data))
          .catch(err => console.error("Error generating hotels:", err));
      }, 5000);
    } else {
      clearInterval(generatorIntervalRef.current);
    }

    return () => clearInterval(generatorIntervalRef.current);
  }, [isGenerating]);

  const toggleGeneration = () => {
    setIsGenerating(prev => !prev);
  };

  const handleAdd = async (newHotel) => {
    if (!isOnline || !isServerUp) {
      queueOperation("POST", newHotel);
      return;
    }

    const { videoFile, ...hotelData } = newHotel;

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/hotels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHotel),
    });
    if (!response.ok) {
      console.error("Failed to add hotel");
      return;
    }
    const addedHotel = await response.json();
    if (videoFile) {
      const videoForm = new FormData();
      videoForm.append("video", videoFile);
  
      try {
        const uploadResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/hotels/${addedHotel.name}/video`, {
          method: 'POST',
          body: videoForm
        });
  
        if (uploadResponse.ok) {
          const { video_url } = await uploadResponse.json();
          addedHotel.video_url = video_url;
        } else {
          console.warn("Video upload failed");
        }
      } catch (err) {
        console.error("Video upload error:", err);
      }
    }
  
    setHotels(prev => [...prev, addedHotel]);
  };

  const handleUpdate = async (updatedHotel) => {
    if (!isOnline || !isServerUp) {
      queueOperation("PUT", updatedHotel, `/${updatedHotel.name}`);
      return;
    }
  
    const { videoFile, video_url, video, ...hotelData } = updatedHotel;

    if (!videoFile) {
      hotelData.video = video;
      hotelData.video_url = video_url;
    } else {
      hotelData.video = ""; // let backend overwrite after upload
      hotelData.video_url = "";
    }
  
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/hotels/${updatedHotel.name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotelData),
    });
  
    if (!res.ok) {
      console.error("Failed to update hotel");
      return;
    }
  
    const savedHotel = await res.json();
  
    if (videoFile) {
      const videoForm = new FormData();
      videoForm.append("video", videoFile);
  
      try {
        const videoRes = await fetch(`${process.env.REACT_APP_API_URL}/api/hotels/${updatedHotel.name}/video`, {
          method: 'POST',
          body: videoForm,
        });
  
        if (videoRes.ok) {
          const { video_url } = await videoRes.json();
          savedHotel.video_url = video_url;
        } else {
          console.warn("Video upload failed");
        }
      } catch (err) {
        console.error("Video upload error:", err);
      }
    }
  
    setHotels(prev =>
      prev.map(h => (h.name === savedHotel.name ? savedHotel : h))
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
      
      <div style={{ padding: '1rem', background: '#f2f2f2', textAlign: 'center' }}>
        <button onClick={toggleGeneration} style={{ padding: '10px 20px' }}>
          {isGenerating ? 'Stop Generating Hotels' : 'Start Generating Hotels'}
        </button>
      </div>
      
      <Routes>
        <Route
          path="/"
          element={<HomePage filtersList={filters} hotelsList={hotels} isGenerating={isGenerating} toggleGeneration={toggleGeneration}/>}
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
