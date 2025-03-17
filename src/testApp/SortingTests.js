import Hotel from '../types/Hotel.js';

class SortingTests {
    constructor() {
        this.hotels = [];
        this.sortOrder = 'asc';
    }

    addHotel(hotel) {
        this.hotels.push(hotel);
    }

    sortHotelsByStars() {
        if (this.sortOrder === 'asc') {
            this.hotels = [...this.hotels].sort((a, b) => b.number_of_stars - a.number_of_stars);
            this.sortOrder = 'desc';
        } else {
            this.hotels = [...this.hotels].sort((a, b) => a.number_of_stars - b.number_of_stars);
            this.sortOrder = 'asc';
        }
    }
}

export default SortingTests;