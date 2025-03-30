// backend/utils/generateHotels.js

function generateRandomHotels(count) {
    const locations = ["New York", "Paris", "London", "Tokyo", "Dubai", "Cluj-Napoca"];
    const facilities = ["Free WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant", "Free Parking"];
    const images = [""];
  
    return Array.from({ length: count }, (_, i) => ({
      name: `Hotel ${Date.now()}-${i}`,
      number_of_stars: Math.floor(Math.random() * 5) + 1,
      location: locations[Math.floor(Math.random() * locations.length)],
      location_maps: "https://example.com/maps",
      cover_image: images[0],
      images: [images[0]],
      description: "A generated hotel",
      facilities: [facilities[Math.floor(Math.random() * facilities.length)]],
      price_per_night: Math.floor(Math.random() * 500) + 50,
    }));
  }
  
  module.exports = { generateRandomHotels };
  