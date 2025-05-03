import React, { useState } from "react";
import './styles.css';
import Header from "../../components/Header";
import Hotel from "../../types/Hotel";
import PropTypes from "prop-types";
import {FaStar} from "react-icons/fa";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import CustomButton from "../../components/CustomButton";
import { SiTicktick } from "react-icons/si";
import { Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const HotelDescriptionPage = ({hotels, onDelete}) => {
    const { name } = useParams();
    const navigate = useNavigate();
    const hotel = hotels.find((hotel) => hotel.name === name);

    const noImageAvailable = "../../assets/no-image-available.jpg";
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleDelete = () => {
        onDelete(hotel.name);
        navigate("/", { state: { message: "Hotel successfully deleted" } });
    };

    if (!hotel) {
        return null;
    }

    const handleNextImage = () => {
        if (!hotel.images || hotel.images.length === 0) return;
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % hotel.images.length);
    };
    
    const handlePrevImage = () => {
        if (!hotel.images || hotel.images.length === 0) return;
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + hotel.images.length) % hotel.images.length);
    };    

    const stars = [];
    for (let i = 0; i < hotel.number_of_stars; i++) {
        stars.push(<FaStar key={i} className='yellow-star' size={20} />);
    }
    for(let i = hotel.number_of_stars; i < 5; i++) {
        stars.push(<FaStar key={i} color='gray' size={20} />);
    }

    

    return (
        <div>
            <Header />
            <div className="description">
                <div className="description-header">
                    <Link to={"/"}>
                        <CustomButton label={""} className={"back-button"} iconFront={<MdKeyboardArrowLeft size={"35px"}  />} />
                    </Link>
                    <div className="hotel-info">
                        <div className="hotel-name">
                            <div style={{marginRight: 8}}>{hotel.name}</div>
                            {stars}
                        </div>
                        <a href={hotel.location_maps} target="_blank">{hotel.location}</a>
                    </div>
                </div>
                
                <div className="actions">
                    <Link to={`/update/${hotel.name}`}>
                        <CustomButton label={"Edit Hotel"} className={"edit-button"} />
                    </Link>
                    <CustomButton label={"Remove Hotel"} className={"remove-button"} onClick={handleDelete} />
                </div>
            </div>


            <div className="slideshow-container">
                <div className="slideshow">
                    <MdKeyboardArrowLeft onClick={handlePrevImage} className="prev" />
                    <img src={hotel.images?.[currentImageIndex]?.image_url || noImageAvailable } alt="hotel" className="slideshow-image" onError={(e) => (e.target.src = noImageAvailable)} />
                    <MdKeyboardArrowRight onClick={handleNextImage} className="next" />
                </div>
                <div className="dots-container">
                    {hotel.images?.length > 0 && hotel.images?.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${currentImageIndex === index ? "active" : ""}`}
                            onClick={() => setCurrentImageIndex(index)}
                        ></span>
                    ))}
                </div>
            </div>

            <div className="hotel-description">
                <label className="description-label">Description</label>
                {hotel.description}
            </div>

            <div className="hotel-facilities">
                <label className="facilities-label">Facilities</label>
                <ul>
                    {hotel.facilities?.map((facility, index) => (
                        <li key={index} className="facilities-list"><SiTicktick className="facility-icon" /><label style={{marginLeft: 5}}>{facility.name}</label></li>
                    ))}
                </ul>
            </div>

            {hotel.video_url && (
            <div className="hotel-video">
                <video width="640" height="360" controls>
                <source src={hotel.video_url} type="video/mp4" />
                Your browser does not support the video tag.
                </video>
            </div>
            )}
        </div>
    );
};

HotelDescriptionPage.propTypes = {
    hotels: PropTypes.arrayOf(PropTypes.instanceOf(Hotel)).isRequired,
    onDelete: PropTypes.func.isRequired
};

export default HotelDescriptionPage;