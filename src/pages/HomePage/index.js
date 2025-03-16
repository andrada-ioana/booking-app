import React from 'react';
import Header from '../../components/Header';
import './styles.css';
import { IoBedOutline } from "react-icons/io5";
import { IoIosMenu } from "react-icons/io";
import FilterCard from '../../components/FilterCard';
import HotelCard from '../../components/HotelCard';
import CustomButton from '../../components/CustomButton';
import Hotel from '../../types/Hotel';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import MessageModal from '../../components/MessageModal';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const HomePage = ({filtersList, hotelsList}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState('');

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStars, setSelectedStars] = useState([]);
    const [filteredHotels, setFilteredHotels] = useState([]);

    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
            setIsModalOpen(true);
            navigate("/", { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    const handleStarFilter = (selectedStarsArray) => {
        const numericStars = selectedStarsArray.map(star => parseInt(star, 10));
    
        console.log("Selected Stars before update:", selectedStars);
        console.log("New Selected Stars:", numericStars);
    
        setSelectedStars(numericStars);
    };
    
    useEffect(() => {
        let filtered = [...hotelsList];
    
        if (searchTerm) {
            filtered = filtered.filter(
                (hotel) =>
                    hotel.name.toLowerCase().includes(searchTerm) ||
                    hotel.location.toLowerCase().includes(searchTerm)
            );
        }
    
        if (selectedStars.length > 0) {
            filtered = filtered.filter((hotel) => selectedStars.includes(hotel.number_of_stars));
        }
    
        console.log("Filtered Hotels:", filtered);
        setFilteredHotels(filtered);
    }, [searchTerm, selectedStars, hotelsList]);

    return (
        <div>
            <Header />
            <MessageModal isOpen={isModalOpen} onRequestClose={closeModal} message={message} />
            <div className='search-box'>
                <div className='filter-bar'>
                    <IoBedOutline className='input-icon' fontSize={20} />
                    <input className='input-with-icon' placeholder="Destination" value={searchTerm} onChange={handleSearchChange} />
                </div>
                <IoIosMenu color='white' fontSize={50} />
            </div>
            <Link to='/add-hotel' className='add-hotel' >
                <CustomButton label="Add hotel" className="add-hotel-button" />
            </Link>
            <div className='hotel-filters'>
                <div className="filters">
                    {filtersList.map((filter) =>
                        filter.label === "Stars" ? (
                            <FilterCard
                                key={filter.label}
                                label={filter.label}
                                icon={filter.icon}
                                options={filter.options}
                                selectedOptions={selectedStars}
                                onSelect={handleStarFilter} 
                            />
                        ) : (
                            <FilterCard key={filter.label} label={filter.label} icon={filter.icon} options={filter.options} />
                        )
                    )}
                </div>
                <div className="hotel-list">
                    {filteredHotels.length > 0 ? (
                        filteredHotels.map((hotel) => <HotelCard key={hotel.name} hotel={hotel} />)
                    ) : (
                        <p className="no-hotels">No hotels match your criteria.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

HomePage.propTypes = {
    filtersList: PropTypes.array.isRequired,
    hotelsList: PropTypes.arrayOf(PropTypes.instanceOf(Object)).isRequired
};

export default HomePage