import Hotel from '../types/Hotel.js';
import Repository from '../repository/repository.js';

describe('Repository CRUD Operations', () => {
    let repository;

    beforeEach(() => {
        repository = new Repository(); 
    });

    it('should add a new hotel', () => {
        const hotel = new Hotel("Hotel1", 5, "Cluj-Napoca", "url", "image.jpg", ["image.jpg"], "Luxury Hotel", ["Free WiFi"], 250);
        
        repository.addHotel(hotel);
        
        expect(repository.getHotelsList().length).toBe(4); // 3 exist, adding 1 more
        expect(repository.getHotelsList()[3].name).toBe("Hotel1");
    });

    
    it('should retrieve hotels from repository', () => {
        const hotels = repository.getHotelsList();
        
        expect(hotels.length).toBe(3); // Repository starts with 3 hotels
        expect(hotels[0].name).toBe("Grand Hotel Italia");
        expect(hotels[1].name).toBe("Hotel Platinia");
    });

    it('should update an existing hotel', () => {
        const updatedHotel = new Hotel("Grand Hotel Italia", 3, "New Location", "url", "new-image.jpg", ["new-image.jpg"], "Updated Description", ["Gym"], 200);

        repository.updateHotel(repository.getHotelsList()[0], updatedHotel);
        
        expect(repository.getHotelsList()[0].number_of_stars).toBe(3);
        expect(repository.getHotelsList()[0].location).toBe("New Location");
        expect(repository.getHotelsList()[0].price_per_night).toBe(200);
    });

    it('should delete a hotel', () => {
        repository.deleteHotel("Hotel Platinia");

        expect(repository.getHotelsList().length).toBe(2);
        expect(repository.getHotelsList().some(h => h.name === "Hotel Platinia")).toBe(false);
    });

    it('should retrieve facilities list from repository', () => {
        const facilities = repository.getFacilitiesList();

        expect(facilities.length).toBe(9);
        expect(facilities).toContain("Spa");
    });

    it('should manage all crud operations', () => {
        const hotel = new Hotel("Hotel1", 5, "Cluj-Napoca", "url", "image.jpg", ["image.jpg"], "Luxury Hotel", ["Free WiFi"], 250);
        repository.addHotel(hotel);

        expect(repository.getHotelsList().length).toBe(4);

        repository.deleteHotel("Hotel1");

        expect(repository.getHotelsList().length).toBe(3);

        const updatedHotel = new Hotel("Grand Hotel Italia", 3, "New Location", "url", "new-image.jpg", ["new-image.jpg"], "Updated Description", ["Gym"], 200);
        repository.updateHotel(repository.getHotelsList()[0], updatedHotel);

        expect(repository.getHotelsList()[0].number_of_stars).toBe(3);
        expect(repository.getHotelsList()[0].location).toBe("New Location");
        expect(repository.getHotelsList()[0].price_per_night).toBe(200);
    });

});
