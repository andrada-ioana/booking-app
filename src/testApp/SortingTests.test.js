import Hotel from '../types/Hotel.js';
import SortingTests from '../testApp/SortingTests.js';

describe('TestHotelSorting', () => {
    let sortingTest;

    beforeEach(() => {
        sortingTest = new SortingTests();
    });

    it('should sort hotels by stars in descending order', () => {
        const hotels = [
            new Hotel("Hotel1", 5, "Location1", "Location1", "CoverImage1", ["Image1"], "Description1", ["Facility1"]),
            new Hotel("Hotel2", 4, "Location2", "Location2", "CoverImage2", ["Image2"], "Description2", ["Facility2"]),
            new Hotel("Hotel3", 3, "Location3", "Location3", "CoverImage3", ["Image3"], "Description3", ["Facility3"]),
            new Hotel("Hotel4", 2, "Location4", "Location4", "CoverImage4", ["Image4"], "Description4", ["Facility4"]),
            new Hotel("Hotel5", 1, "Location5", "Location5", "CoverImage5", ["Image5"], "Description5", ["Facility5"]),
        ];

        hotels.forEach(hotel => sortingTest.addHotel(hotel));
        sortingTest.sortHotelsByStars();

        expect(sortingTest.hotels[0].number_of_stars).toBe(5);
        expect(sortingTest.hotels[1].number_of_stars).toBe(4);
        expect(sortingTest.hotels[2].number_of_stars).toBe(3);
        expect(sortingTest.hotels[3].number_of_stars).toBe(2);
        expect(sortingTest.hotels[4].number_of_stars).toBe(1);
    });
});