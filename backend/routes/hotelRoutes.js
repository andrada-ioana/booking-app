const express = require('express');
const router = express.Router();
const { Hotel, Facility, HotelImage } = require('../models');

// Get all hotels
router.get('/', async (req, res) => {
  const hotels = await Hotel.findAll({ include: [Facility, HotelImage] });
  res.json(hotels);
});

// Create hotel
router.post('/', async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update hotel
router.put('/:id', async (req, res) => {
  await Hotel.update(req.body, { where: { id: req.params.id } });
  const updated = await Hotel.findByPk(req.params.id);
  res.json(updated);
});

// Delete hotel
router.delete('/:id', async (req, res) => {
  await Hotel.destroy({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = router;
