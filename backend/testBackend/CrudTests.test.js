const request = require('supertest');
const app = require('../server');

describe('Hotel API CRUD Operations', () => {
  let hotelName = 'Test Hotel';

  it('should retrieve all hotels', async () => {
    const res = await request(app).get('/api/hotels');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should add a new hotel', async () => {
    const newHotel = {
      name: hotelName,
      number_of_stars: 5,
      location: "Cluj-Napoca",
      location_maps: "https://example.com/maps",
      description: "Luxury Hotel",
      cover_image: "cover.jpg",
      images: ["img1.jpg", "img2.jpg"],
      facilities: ["Free WiFi"],
      price_per_night: 250
    };

    const res = await request(app)
      .post('/api/hotels')
      .send(newHotel);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(hotelName);
  });

  it('should update an existing hotel', async () => {
    const updatedHotel = {
      name: hotelName,
      number_of_stars: 3,
      location: "Updated Location",
      location_maps: "https://updated.com/maps",
      description: "Updated Description",
      cover_image: "updated.jpg",
      images: ["updated1.jpg"],
      facilities: ["Gym"],
      price_per_night: 199
    };

    const res = await request(app)
      .put(`/api/hotels/${hotelName}`)
      .send(updatedHotel);

    expect(res.statusCode).toBe(200);
    expect(res.body.location).toBe("Updated Location");
  });

  it('should retrieve facilities', async () => {
    const res = await request(app).get('/api/facilities');
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("Spa");
  });

  it('should delete a hotel', async () => {
    const res = await request(app).delete(`/api/hotels/${hotelName}`);
    expect(res.statusCode).toBe(204);

    const check = await request(app).get('/api/hotels');
    const hotelExists = check.body.some(h => h.name === hotelName);
    expect(hotelExists).toBe(false);
  });

  it('should generate 5 random hotels', async () => {
    const res = await request(app).post('/api/hotels/generate/5');
    expect(res.statusCode).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(5);
  });
});

afterAll((done) => {
  if (app && app.close) {
    app.close(done);
  } else {
    done();
  }
});
