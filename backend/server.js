const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

const hotelsFilePath = path.join(__dirname, 'MockData', 'hotels.json');
const filtersFilePath = path.join(__dirname, 'MockData', 'filters.json');
const facilitiesFilePath = path.join(__dirname, 'MockData', 'facilities.json');

let hotels = JSON.parse(fs.readFileSync(hotelsFilePath, 'utf8'));
let filters = JSON.parse(fs.readFileSync(filtersFilePath, 'utf8'));
let facilities = JSON.parse(fs.readFileSync(facilitiesFilePath, 'utf8'));

app.get('/api/hotels', (req, res) => {
    res.json(hotels);
});

app.get('/api/filters', (req, res) => {
    res.json(filters);
});

app.get('/api/facilities', (req, res) => {
    res.json(facilities);
});

app.post('/api/hotels', (req, res) => {
    const hotel = req.body;
    if(!hotel.name || !hotel.location || !hotel.price_per_night) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    hotels.push(hotel);
    res.status(201).json(hotel);
});

app.put('/api/hotels/:name', (req, res) => {
    const name = req.params.name;
    const updatedHotel = req.body;
    if(!updatedHotel.name || !updatedHotel.location || !updatedHotel.price_per_night) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
    if(updatedHotel.stars && (updatedHotel.stars < 0 || updatedHotel.stars > 5)) {
        return res.status(400).json({ error: 'Stars must be between 0 and 5.' });
    }
    if(typeof updatedHotel.price_per_night !== 'number') {
        return res.status(400).json({ error: 'Price per night must be a number.' });
    }
    if(updatedHotel.price_per_night < 0) {
        return res.status(400).json({ error: 'Price per night cannot be negative.' });
    }
    const hotelIndex = hotels.findIndex(h => h.name === name);
    if (hotelIndex === -1) {
        return res.status(404).json({ error: 'Hotel not found.' });
    }
    hotels[hotelIndex] = updatedHotel;
    res.json(updatedHotel);
});

app.delete('/api/hotels/:name', (req, res) => {
    const name = req.params.name;
    const initialLength = hotels.length;
    hotels = hotels.filter(h => h.name !== name);
    if (hotels.length === initialLength) {
        return res.status(404).json({ error: 'Hotel not found.' });
    }   
    res.status(204).send();
});

app.get('/api/hotels/filter', (req, res) => {
    const {stars, sort} = req.query;
    let filteredHotels = hotels;
    if (stars) {
        const starsArray = stars.split(',').map(Number);
        filteredHotels = filteredHotels.filter(hotel => starsArray.includes(hotel.number_of_stars));
    }

    if(sort === 'asc') {
        filteredHotels.sort((a, b) => a.price_per_night - b.price_per_night);
    } else if(sort === 'desc') {
        filteredHotels.sort((a, b) => b.price_per_night - a.price_per_night);
    }
    res.json(filteredHotels);
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});