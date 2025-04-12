class Hotel {
    constructor(name, number_of_stars, location, location_maps, cover_image, images, description, facilities, price_per_night, video_url = "", video = "") {
        this.name = name;
        this.number_of_stars = number_of_stars;
        this.location = location;
        this.location_maps = location_maps;
        this.description = description;
        this.facilities = facilities;
        this.cover_image = cover_image;
        this.images = images;
        this.price_per_night = price_per_night;
        this.video_url = video_url;
        this.video = video;
    }
};

export default Hotel;