// backend/utils/generateHotels.js

// function generateRandomHotels(count) {
//     const locations = ["New York", "Paris", "London", "Tokyo", "Dubai", "Cluj-Napoca"];
//     const facilities = ["Free WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant", "Free Parking"];
//     const images = [""];
  
//     return Array.from({ length: count }, (_, i) => ({
//       name: `Hotel ${Date.now()}-${i}`,
//       number_of_stars: Math.floor(Math.random() * 5) + 1,
//       location: locations[Math.floor(Math.random() * locations.length)],
//       location_maps: "https://example.com/maps",
//       cover_image: images[0],
//       images: [images[0]],
//       description: "A generated hotel",
//       facilities: [facilities[Math.floor(Math.random() * facilities.length)]],
//       price_per_night: Math.floor(Math.random() * 500) + 50,
//     }));
//   }

const { faker } = require('@faker-js/faker');

function generateRandomHotels(count, facilityList) {
  return Array.from({ length: count }, (_, i) => {
    const randomFacilityCount = faker.number.int({ min: 1, max: Math.min(5, facilityList.length) });
    const shuffledFacilities = faker.helpers.shuffle(facilityList);
    const selectedFacilities = shuffledFacilities.slice(0, randomFacilityCount).map(f => f.name);

    return {
      name: `Hotel ${faker.company.name()} ${Date.now()}-${i}`,
      number_of_stars: faker.number.int({ min: 1, max: 5 }),
      location: faker.location.city(),
      location_maps: faker.internet.url(),
      cover_image: faker.image.urlPicsumPhotos(), // e.g. https://picsum.photos/200
      images: [
        faker.image.urlPicsumPhotos(),
        faker.image.urlPicsumPhotos()
      ],
      description: faker.lorem.paragraphs(2),
      facilities: selectedFacilities,
      price_per_night: faker.number.int({ min: 50, max: 500 })
    };
  });
}
  
  module.exports = { generateRandomHotels };
  