import { IoBedOutline } from "react-icons/io5";
import Hotel from "../types/Hotel";

class Repository {
  constructor() {
    this.allFacilities = ["Free WiFi", "Swimming Pool", "Spa", "Free Parking", "Gym", "Restaurant", "Free Breakfast", "Airport Shuttle", "Pet Friendly"];

    this.filtersList = [
        {
            label: "Stars",
            icon: <IoBedOutline size={"24px"} />,
            options: ["1", "2", "3", "4", "5"]
        }
    ];

    this.hotelsList = [
        new Hotel(
            "Grand Hotel Italia",
            4,
            "Cluj-Napoca",
            "https://www.google.com/maps/place/Grand+Hotel+Italia/@46.7520955,23.6060333,288m/data=!3m2!1e3!4b1!4m9!3m8!1s0x47490dca8d6e3fb3:0xc5070934d476fab6!5m2!4m1!1i2!8m2!3d46.7520955!4d23.6060333!16s%2Fg%2F1hd_6lmbr?entry=ttu&g_ep=EgoyMDI1MDMxMi4wIKXMDSoASAFQAw%3D%3D",
            "../../assets/image1.jpg",
            ["../../assets/image1.jpg", "../../assets/image2.jpg", "../../assets/image3.jpg"],
            "Situat în cartierul rezidențial exclusivist Bună Ziua, deasupra centrului orașului Cluj, Grand Hotel Italia este un hotel luxos tip palat, mobilat în stil italian Liberty. Proprietatea oferă WiFi gratuit şi parcare gratuită.  Camerele spaţioase şi elegante au podea cu marmură sau parchet şi mobilier în stil Liberty. Băile somptuoase sunt placate cu mozaic preţios din sticlă şi includ o cadă spa. Printre facilități se numără un TV cu ecran plat de 32 inch cu canale prin satelit, un minibar și un seif pentru laptop. Multe dintre camere beneficiază de balcon.  Grand Hotel Italia are un hol mare cu pardoseală de marmură şi candelabre din sticlă de Murano, precum și un restaurant specializat în bucătărie italiană și internațională.  Centrul oraşului Cluj se află la 4 km, iar gara din Cluj este situată la aproximativ 5 km. Aeroportul Internaţional Cluj-Napoca se găsește la 20 de minute de mers cu maşina. Cuplurile apreciază în mod deosebit această locație. I-au dat scorul 8,8 pentru un sejur pentru 2 persoane.",
            ["Free WiFi", "Swimming Pool", "Spa"],
            300
        ),
        new Hotel(
            "Hotel Platinia",
            3,
            "Cluj-Napoca",
            "https://www.google.com/maps/place/Hotel+Platinia/@46.7716765,23.5916016,17z/data=!3m1!4b1!4m9!3m8!1s0x47490dca8d6e3fb3:0xc5070934d476fab6!5m2!4m1!1i2!8m2!3d46.7520955!4d23.6060333",
            "",
            ["https://example.com/image3.jpg", "https://example.com/image4.jpg"],
            "A modern hotel in Cluj-Napoca.",
            ["Free Parking", "Gym", "Restaurant"],
            150
        ),
        new Hotel(
            "Hotel Beyfin",
            5,
            "Cluj-Napoca",
            "https://www.google.com/maps/place/Hotel+Beyfin/@46.7690577,23.5862759,17z/data=!3m1!4b1!4m9!3m8!1s0x47490dca8d6e3fb3:0xc5070934d476fab6!5m2!4m1!1i2!8m2!3d46.7520955!4d23.6060333",
            "",
            ["https://example.com/image5.jpg", "https://example.com/image6.jpg"],
            "A premium hotel in Cluj-Napoca.",
            ["Free Breakfast", "Airport Shuttle", "Pet Friendly"],
            400
        ),
        ...this.generateRandomHotels(50)
    ];
  }

    generateRandomHotel = (index) => {
        const locations = ["New York", "Paris", "London", "Tokyo", "Dubai", "Cluj-Napoca"];
        const facilities = ["Free WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant", "Free Parking"];
        const images = [""];

        return new Hotel(
            `Hotel ${index}`,
            Math.floor(Math.random() * 5) + 1, 
            locations[Math.floor(Math.random() * locations.length)], 
            "https://example.com/maps", 
            images[Math.floor(Math.random() * images.length)],
            [images[Math.floor(Math.random() * images.length)]],
            "A randomly generated hotel for testing purposes.", 
            [facilities[Math.floor(Math.random() * facilities.length)]], 
            Math.floor(Math.random() * 500) + 50 
        );
    };

    generateRandomHotels = (count) => {
        return Array.from({ length: count }, (_, i) => this.generateRandomHotel(i + 1));
    };
    

    getHotelsList() {
        return this.hotelsList;
    }

    setHotelsList(hotels) {
        this.hotelsList = hotels;
    }

    getFiltersList() {
        return this.filtersList;
    }

    getFacilitiesList() {
        return this.allFacilities;
    }

    addHotel(hotel) {
        this.hotelsList.push(hotel);
    }

    deleteHotel(hotelName) {
        this.hotelsList = this.hotelsList.filter(h => h.name !== hotelName);
    }

    updateHotel(oldHotel, newHotel) {
        const index = this.hotelsList.findIndex(h => h.name === oldHotel.name);
        if (index !== -1) {
            this.hotelsList[index] = newHotel;
        }
    }
}

export default Repository;