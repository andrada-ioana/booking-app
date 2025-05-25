const { logAction } = require('./utils/logAction');
const { Op, Sequelize } = require('sequelize');
const { requireAuth, requireAdmin } = require('./middleware/auth');
const { Hotel, HotelImage } = require('./models');
const { Facility } = require('./models');
const { Filter, FilterOption } = require('./models');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { generateRandomHotels } = require('./utils/generateHotels');
const http = require('http');
const { Server } = require('socket.io');
const PORT = 3001;
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const { monitorSuspiciousUsers, startMonitorThread } = require('./monitor/monitorLogs');
startMonitorThread();
const adminController = require('./controllers/admin');
app.get('/api/admin/monitored-users', requireAuth, requireAdmin, adminController.getMonitoredUsers);


const os = require("os");
const interfaces = os.networkInterfaces();

// Use relative URLs for production
const localIP = process.env.NODE_ENV === 'production' ? '' : 'localhost';

const multer = require('multer');
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      console.log('Storing file:', file.originalname);
      cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
      const filename = Date.now() + '-' + file.originalname;
      console.log('Generated filename:', filename);
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    console.log('Checking file type:', file.mimetype);
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

// Error handling middleware for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 500MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// WebSocket server will be created only if not in test mode
let server = null;
let io = null;

let generationInterval = null;

const authController = require('./controllers/auth');

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

app.get('/api/test/run-monitor', async (req, res) => {
  await monitorSuspiciousUsers();
  res.send("Monitor check complete");
});

app.post('/api/generation/start', async (req, res) => {
  if (!generationInterval) {
    generationInterval = setInterval(async () => {
      const newHotels = generateRandomHotels(1);
      for (const hotel of newHotels) {
        try {
          const createdHotel = await Hotel.create(hotel);
          console.log('Generated new hotel:', createdHotel.name);
          if (io) io.emit('newHotel', createdHotel);
        } catch (err) {
          console.error('Error creating hotel:', err);
        }
      }
    }, 5000);
    return res.status(200).json({ message: "Hotel generation started." });
  }
  res.status(200).json({ message: "Already generating." });
});


app.post('/api/generation/stop', (req, res) => {
  if (generationInterval) {
    clearInterval(generationInterval);
    generationInterval = null;
    return res.status(200).json({ message: "Hotel generation stopped." });
  }
  res.status(200).json({ message: "Generation was not running." });
});

app.post('/api/hotels/generate/:count', requireAuth, async (req, res) => {
  const count = parseInt(req.params.count, 10) || 5;
  const allFacilities = await Facility.findAll();
  const newHotels = generateRandomHotels(count, allFacilities);
  const createdHotels = [];

  for (const hotelData of newHotels) {
    try {
      const { facilities = [], images = [], ...hotelFields } = hotelData;

      const createdHotel = await Hotel.create(hotelFields);
      await logAction(req.user.userId, 'CREATE', 'Hotel', createdHotel.id);

      if (facilities.length > 0) {
        const facilityInstances = await Facility.findAll({
          where: { name: facilities }
        });
        await createdHotel.setFacilities(facilityInstances);
      }

      for (const img of images) {
        if (img) {
          await HotelImage.create({
            image_url: img,
            HotelId: createdHotel.id
          });
        }
      }

      createdHotels.push(createdHotel);
      if (io) io.emit('newHotel', createdHotel);
    } catch (err) {
      console.error('Error creating hotel with associations:', err);
    }
  }

  console.log(`Added ${createdHotels.length} hotels.`);
  res.status(201).json(createdHotels);
});



app.get('/api/hotels', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;

    if (isNaN(limit) || isNaN(offset) || limit < 0 || offset < 0) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const hotels = await Hotel.findAll({
      limit,
      offset,
      include: [{
        model: Facility,
        as: 'facilities',
        through: { attributes: [] }, // hide join table fields
      },
      {
        model: HotelImage,
        as: 'images',
        attributes: ['image_url'],
      }],
      order: [['createdAt', 'DESC']]
    });

    await logAction(req.user.userId, 'READ', 'Hotel');
    res.status(200).json(hotels);
  } catch (err) {
    console.error('Error fetching hotels:', err);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});

app.get('/api/filters', async (req, res) => {
  try {
    const filters = await Filter.findAll({
      include: [{ model: FilterOption, as: 'FilterOptions' }]
    });
    

    const formatted = filters.map(f => ({
      label: f.label,
      icon: f.icon,
      options: f.FilterOptions.map(opt => opt.value)
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Error fetching filters:', err);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});


app.get('/api/facilities', async (req, res) => {
  try {
    const facilities = await Facility.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]  // Order alphabetically
    });
    res.status(200).json(facilities);
  } catch (err) {
    console.error('Error fetching facilities:', err);
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

app.post('/api/hotels', requireAuth, async (req, res) => {
  try {
    const { name, location, price_per_night, facilities = [], ...rest } = req.body;

    if (!name || !location || !price_per_night) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Create the hotel first (without facilities)
    const hotel = await Hotel.create({
      name,
      location,
      price_per_night,
      ...rest
    });

    await logAction(req.user.userId, 'CREATE', 'Hotel', hotel.id);

    // If facilities are provided, link them
    console.log('Requested facilities:', facilities);
    if (Array.isArray(facilities) && facilities.length > 0) {
      console.log('Reached facilities block'); // ← ADD THIS
    
      const facilityInstances = await Facility.findAll({
        where: { name: facilities }
      });
    
      console.log('Requested facilities:', facilities);
      console.log('Matched in DB:', facilityInstances.map(f => f.name));
    
      await hotel.setFacilities(facilityInstances);
    }
    

    // Re-fetch with associations to return full hotel data
    const fullHotel = await Hotel.findOne({
      where: { id: hotel.id },
      include: [{ model: Facility, as: 'facilities' }]
    });

    res.status(201).json(fullHotel);
  } catch (err) {
    console.error('Error creating hotel:', err);
    res.status(500).json({ error: 'Failed to create hotel' });
  }
});


app.put('/api/hotels/:name', requireAuth, async(req, res) => {
  try {
    console.log('Updating hotel:', req.params.name);
    console.log('Request body:', req.body);
    
    const hotel = await Hotel.findOne({ where: { name: req.params.name } });
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

    const updatedHotel = req.body;
    console.log('Video file in request:', !!req.file);
    console.log('Video URL in request:', updatedHotel.video_url);

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

    await hotel.update(updatedHotel);
    console.log('Hotel updated with data:', hotel.toJSON());
    await logAction(req.user.userId, 'UPDATE', 'Hotel', hotel.id);

    if (Array.isArray(updatedHotel.facilities)) {
      const facilities = await Facility.findAll({
        where: {
          name: updatedHotel.facilities
        }
      });

      await hotel.setFacilities(facilities);
    }

    // Re-fetch with updated associations
    const updatedData = await Hotel.findOne({
      where: { id: hotel.id },
      include: [{ model: Facility, as: 'facilities' }]
    });
    console.log('Final hotel data:', updatedData.toJSON());

    res.json(updatedData);
  } catch (err) {
    console.error('Error updating hotel:', err);
    res.status(500).json({ error: 'Failed to update hotel' });
  }
});

app.delete('/api/hotels/:name', requireAuth, async (req, res) => {
  try {
    const result = await Hotel.destroy({ where: { name: req.params.name } });
    if (result === 0) return res.status(404).json({ error: 'Hotel not found' });
    await logAction(req.user.userId, 'DELETE', 'Hotel');
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting hotel:', err);
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
});

app.get('/api/hotels/filter', async (req, res) => {
  const { stars, sort } = req.query;

  const whereClause = {};
  if (stars) {
    const starsArray = stars.split(',').map(Number);
    whereClause.number_of_stars = { [Op.in]: starsArray };
  }

  const orderClause = [];
  if (sort === 'asc') {
    orderClause.push(['price_per_night', 'ASC']);
  } else if (sort === 'desc') {
    orderClause.push(['price_per_night', 'DESC']);
  }

  try {
    const hotels = await Hotel.findAll({
      where: whereClause,
      order: orderClause
    });
    res.json(hotels);
  } catch (err) {
    console.error('Error filtering hotels:', err);
    res.status(500).json({ error: 'Failed to filter hotels' });
  }
});

app.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.download(filePath);
});

// Helper function to construct URLs
const constructUrl = (filename) => {
  return `/uploads/${filename}`;
};

app.post('/api/hotels/:name/cover-image', requireAuth, upload.single('cover'), async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ where: { name: req.params.name } });
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

    const imageUrl = constructUrl(req.file.filename);
    hotel.cover_image = imageUrl;
    await hotel.save();
    await logAction(req.user.userId, 'UPLOAD_COVER_IMAGE', 'Hotel', hotel.id);  
    res.status(200).json({ message: 'Cover image uploaded', imageUrl });
  } catch (err) {
    console.error('Error saving cover image:', err);
    res.status(500).json({ error: 'Failed to upload cover image' });
  }
});

app.post('/api/hotels/:name/images', requireAuth, upload.array('images'), async (req, res) => {
  const hotel = await Hotel.findOne({ where: { name: req.params.name } });
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

  try {
    const imageUrls = [];

    for (const file of req.files) {
      const url = constructUrl(file.filename);
      const image = await HotelImage.create({ image_url: url, HotelId: hotel.id });

      await logAction(req.user.userId, 'UPLOAD_IMAGE', 'HotelImage', image.id);
      imageUrls.push(url);
    }

    res.status(200).json({ message: 'Images uploaded', imageUrls });
  } catch (err) {
    console.error('Error saving images:', err);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

app.delete('/api/hotels/:name/images/:filename', requireAuth, async (req, res) => {
  const { name, filename } = req.params;
  const hotel = await Hotel.findOne({ where: { name } });

  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

  try {
    // Delete from DB
    await HotelImage.destroy({
      where: {
        hotelId: hotel.id,
        image_url: { [Op.like]: `%${filename}` }, // assumes image_url ends with filename
      },
    });

    // Optionally delete file from disk (if needed)
    const filePath = path.join(__dirname, 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await logAction(req.user.userId, 'DELETE_IMAGE', 'HotelImage', hotel.id);
    res.status(200).json({ message: 'Image deleted' });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});


app.use('/videos', express.static(path.join(__dirname, 'uploads')));

app.post('/api/hotels/:name/video', requireAuth, upload.single('video'), async (req, res) => {
  const hotelName = req.params.name;
  const hotel = await Hotel.findOne({ where: { name: hotelName } });
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

  try {
    hotel.video = req.file.filename;
    hotel.video_url = constructUrl(req.file.filename);
    await hotel.save();

    await logAction(req.user.userId, 'UPLOAD_VIDEO', 'Hotel', hotel.id);
    res.status(200).json({ message: 'Video uploaded', video_url: hotel.video_url });
  } catch (err) {
    console.error('Error saving video info:', err);
    res.status(500).json({ error: 'Failed to save video' });
  }
});

app.delete('/api/hotels/:name/video', requireAuth, async (req, res) => {
  const hotel = await Hotel.findOne({ where: { name: req.params.name } });
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

  try {
    if (hotel.video) {
      const videoPath = path.join(__dirname, 'uploads', hotel.video);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    hotel.video = '';
    hotel.video_url = '';
    await hotel.save(); // ← Save the cleared fields
    await logAction(req.user.userId, 'DELETE_VIDEO', 'Hotel', hotel.id);
    res.status(200).json({ message: 'Video deleted' });
  } catch (err) {
    console.error('Error deleting video:', err);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

app.get('/api/statistics/avg-price-by-stars', async (req, res) => {
  try {
    const result = await Hotel.findAll({
      attributes: [
        'number_of_stars',
        [Sequelize.fn('AVG', Sequelize.col('price_per_night')), 'avg_price']
      ],
      group: ['number_of_stars'],
      order: [['number_of_stars', 'ASC']]
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('Error calculating average prices:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.get('/api/hotels/:name', requireAuth, async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      where: { name: req.params.name },
      include: [
        { model: Facility, as: 'facilities' },
        { model: HotelImage, as: 'images', attributes: ['image_url'] }
      ]
    });

    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    res.json(hotel);
  } catch (err) {
    console.error('Error fetching hotel:', err);
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
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
    Hotel.findAll().then(hotels => {
      socket.emit('initHotels', hotels);
    });
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.listen(PORT, '0.0.0.0', () => console.log(`Server running at http://0.0.0.0:${PORT}`));
}

module.exports = server || app;
