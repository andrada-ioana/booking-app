import React from 'react';
import './styles.css';
import PropTypes from 'prop-types';
import { FaStar } from "react-icons/fa";
import CustomButton from '../CustomButton';
import { BiSolidRightArrow } from "react-icons/bi";
import Hotel from '../../types/Hotel';
import { Link } from 'react-router-dom';

const HotelCard = ({hotel, styleCard}) => {
    const noImageAvailable = "../../assets/no-image-available.jpg";
    const stars = [];
    for (let i = 0; i < hotel.number_of_stars; i++) {
        stars.push(<FaStar key={i} className='yellow-star' />);
    }
    for(let i = hotel.number_of_stars; i < 5; i++) {
        stars.push(<FaStar key={i} color='gray' />);
    }
    return (
    <div className='hotel-card' style={styleCard}>
        <img src={hotel.cover_image || noImageAvailable} alt="hotel image" className='hotel-image' />
        <div className='hotel-content'>
            <div className='hotel-info'>
                <div className='hotel-details'>
                    <div className='hotel-name'>{hotel.name}</div>
                    {stars}
                </div>
                <a href={hotel.location_maps} target='_blank' className='location-maps'>{hotel.location}</a>
                <div style={{fontSize: "14px"}}>{hotel.price_per_night} RON/noapte</div>
            </div>
            <Link to={`/hotel/${hotel.name}`} className='description-link'>
                <CustomButton label="Vedeti disponibilitatile" className="button-container" iconBack={<BiSolidRightArrow color='white' />} />
            </Link>
        </div>
    </div>
  );
}

HotelCard.propTypes = {
    hotel: PropTypes.instanceOf(Hotel).isRequired
};

export default HotelCard;