const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { generateRandomHotels } = require('./utils/generateHotels');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// WebSocket server will be created only if not in test mode
let server = null;
let io = null;

const hotelsFilePath = path.join(__dirname, 'MockData', 'hotels.json');
const filtersFilePath = path.join(__dirname, 'MockData', 'filters.json');
const facilitiesFilePath = path.join(__dirname, 'MockData', 'facilities.json');

let hotels = JSON.parse(fs.readFileSync(hotelsFilePath, 'utf8'));
let filters = JSON.parse(fs.readFileSync(filtersFilePath, 'utf8'));
let facilities = JSON.parse(fs.readFileSync(facilitiesFilePath, 'utf8'));

app.post('/api/hotels/generate/:count', (req, res) => {
  const count = parseInt(req.params.count, 10) || 5;
  const newHotels = generateRandomHotels(count);
  hotels.push(...newHotels);
  console.log(`Added ${count} hotels. Total now: ${hotels.length}`);

  // Emit new hotels to WebSocket clients
  if (io) {
    newHotels.forEach(hotel => io.emit('newHotel', hotel));
  }

  res.status(201).json(newHotels);
});

app.get('/api/hotels', (req, res) => {
  res.status(200).json(hotels);
});

app.get('/api/filters', (req, res) => {
  res.status(200).json(filters);
});

app.get('/api/facilities', (req, res) => {
  res.status(200).json(facilities);
});

app.post('/api/hotels', (req, res) => {
  const hotel = req.body;
  if (!hotel.name || !hotel.location || !hotel.price_per_night) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  hotels.push(hotel);

  if (io) io.emit('newHotel', hotel); // Send new hotel via socket

  res.status(201).json(hotel);
});

app.put('/api/hotels/:name', (req, res) => {
  const name = req.params.name;
  const updatedHotel = req.body;

  if (!updatedHotel.name || !updatedHotel.location || !updatedHotel.price_per_night) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (updatedHotel.stars && (updatedHotel.stars < 0 || updatedHotel.stars > 5)) {
    return res.status(400).json({ error: 'Stars must be between 0 and 5.' });
  }
  if (typeof updatedHotel.price_per_night !== 'number') {
    return res.status(400).json({ error: 'Price per night must be a number.' });
  }
  if (updatedHotel.price_per_night < 0) {
    return res.status(400).json({ error: 'Price per night cannot be negative.' });
  }

  const index = hotels.findIndex(h => h.name === name);
  if (index === -1) {
    return res.status(404).json({ error: 'Hotel not found.' });
  }

  hotels[index] = updatedHotel;
  res.json(updatedHotel);
});

app.delete('/api/hotels/:name', (req, res) => {
  const name = req.params.name;
  const originalLength = hotels.length;
  hotels = hotels.filter(h => h.name !== name);

  if (hotels.length === originalLength) {
    return res.status(404).json({ error: 'Hotel not found.' });
  }

  res.status(204).send();
});

app.get('/api/hotels/filter', (req, res) => {
  const { stars, sort } = req.query;
  let filtered = hotels;

  if (stars) {
    const starsArray = stars.split(',').map(Number);
    filtered = filtered.filter(h => starsArray.includes(h.number_of_stars));
  }

  if (sort === 'asc') {
    filtered.sort((a, b) => a.price_per_night - b.price_per_night);
  } else if (sort === 'desc') {
    filtered.sort((a, b) => b.price_per_night - a.price_per_night);
  }

  res.json(filtered);
});

// Real-time: Only start server when not in test mode
if (process.env.NODE_ENV !== 'test') {
  server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.emit('initHotels', hotels); // optional: send all on connect

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Periodically generate hotels and emit via WebSocket
  setInterval(() => {
    const newHotels = generateRandomHotels(1);
    hotels.push(...newHotels);
    console.log('Generated new hotel:', newHotels[0]?.name);
    if (io) io.emit('newHotel', newHotels[0]);
  }, 5000);

  server.listen(PORT, () => {
    console.log(`Server + WebSocket running at http://localhost:${PORT}`);
  });
}

module.exports = server || app;
