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

const HotelDescriptionPage = ({selectedHotel, fetchHotelByName, onDelete}) => {
    const { name } = useParams();
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_API_URL || '';

    const noImageAvailable = "../../assets/no-image-available.jpg";
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleDelete = () => {
        onDelete(selectedHotel.name);
        navigate("/", { state: { message: "Hotel successfully deleted" } });
    };

    useEffect(() => {
        if (!selectedHotel || selectedHotel.name !== name) {
        fetchHotelByName(name); // Load hotel from server
        }
    }, [name, selectedHotel, fetchHotelByName]);

    if (!selectedHotel || selectedHotel.name !== name) {
        return <div>Loading hotel details...</div>;
    }

    const handleNextImage = () => {
        if (!selectedHotel.images || selectedHotel.images.length === 0) return;
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % selectedHotel.images.length);
    };
    
    const handlePrevImage = () => {
        if (!selectedHotel.images || selectedHotel.images.length === 0) return;
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + selectedHotel.images.length) % selectedHotel.images.length);
    };    

    const stars = [];
    for (let i = 0; i < selectedHotel.number_of_stars; i++) {
        stars.push(<FaStar key={i} className='yellow-star' size={20} />);
    }
    for(let i = selectedHotel.number_of_stars; i < 5; i++) {
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
                            <div style={{marginRight: 8}}>{selectedHotel.name}</div>
                            {stars}
                        </div>
                        <a href={selectedHotel.location_maps} target="_blank">{selectedHotel.location}</a>
                    </div>
                </div>
                
                <div className="actions">
                    <Link to={`/update/${selectedHotel.name}`}>
                        <CustomButton label={"Edit Hotel"} className={"edit-button"} />
                    </Link>
                    <CustomButton label={"Remove Hotel"} className={"remove-button"} onClick={handleDelete} />
                </div>
            </div>


            <div className="slideshow-container">
                <div className="slideshow">
                    <MdKeyboardArrowLeft onClick={handlePrevImage} className="prev" />
                    <img
                        src={
                            selectedHotel.images?.[currentImageIndex]?.image_url
                            ? `${baseUrl}/${selectedHotel.images[currentImageIndex].image_url}`
                            : noImageAvailable
                        }
                        alt="hotel"
                        className="slideshow-image"
                        onError={e => (e.target.src = noImageAvailable)}
                    />
                    <MdKeyboardArrowRight onClick={handleNextImage} className="next" />
                </div>
                <div className="dots-container">
                    {selectedHotel.images?.length > 0 && selectedHotel.images?.map((_, index) => (
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
                {selectedHotel.description}
            </div>

            <div className="hotel-facilities">
                <label className="facilities-label">Facilities</label>
                <ul>
                    {selectedHotel.facilities?.map((facility, index) => (
                        <li key={index} className="facilities-list"><SiTicktick className="facility-icon" /><label style={{marginLeft: 5}}>{facility.name}</label></li>
                    ))}
                </ul>
            </div>

            {selectedHotel.video_url && (
            <div className="hotel-video">
                <video width="640" height="360" controls>
                <source src={`${baseUrl}/${selectedHotel.video_url}`} type="video/mp4" />
                Your browser does not support the video tag.
                </video>
            </div>
            )}
        </div>
    );
};

HotelDescriptionPage.propTypes = {
    onDelete: PropTypes.func.isRequired
};

export default HotelDescriptionPage;