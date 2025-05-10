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
import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { usePaginatedHotels } from '../../hooks/usePaginatedHotels';

const HomePage = ({ filtersList, isGenerating, toggleGeneration }) => {
    const [itemsPerPage, setItemsPerPage] = useState(5);
    
    const {
        hotels,
        page,
        nextPage,
        prevPage,
        hasMore,
        isLoading
    } = usePaginatedHotels(itemsPerPage);
    const location = useLocation();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState('');

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStars, setSelectedStars] = useState([]);
    const [filteredHotels, setFilteredHotels] = useState([]);
    const [sortOrder, setSortOrder] = useState('asc');

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
        let filtered = [...hotels];
    
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
    }, [searchTerm, selectedStars, hotels]);

    const sortHotelsByStars = () => {
        console.log("Sort Order:", sortOrder);
        if (sortOrder === 'asc') {
            const sortedHotels = [...filteredHotels].sort((a, b) => b.number_of_stars - a.number_of_stars);
            setFilteredHotels(sortedHotels);
            setSortOrder('desc');
        } else {
            const sortedHotels = [...filteredHotels].sort((a, b) => a.number_of_stars - b.number_of_stars);
            setFilteredHotels(sortedHotels);
            setSortOrder('asc');
        }
        console.log("Sort Order:", sortOrder);
    }

    console.log("Filtered Hotels with Valid Prices:", filteredHotels.map(h => h.price_per_night));

    const averagePrice = filteredHotels.length > 0 
        ? filteredHotels.reduce((sum, hotel) => {
            console.log("Hotel Name:", hotel.name, "| Hotel Price:", hotel.price_per_night);
            return sum + parseFloat(hotel.price_per_night);
        }, 0) / filteredHotels.length 
        : 0;

    const renderHotelCard = (hotel) => {
        let highlightStyle = {};

        if (filteredHotels.length > 0) {
            if (parseInt(hotel.price_per_night) > averagePrice + 50) {
                highlightStyle = { border: "2px solid gold" }; // Expensive hotels
            } else if (parseInt(hotel.price_per_night) < averagePrice - 50) {
                highlightStyle = { border: "2px solid #CD7F32" }; // Cheap hotels
            } else {
                highlightStyle = { border: "2px solid silver" }; // Around the average price
            }
        }
        return (
            <HotelCard key={hotel.name} hotel={hotel} styleCard={highlightStyle} />
        );
    };

      const renderPagination = () => (
        <div className="pagination">
        <button onClick={prevPage} disabled={page === 0 || isLoading}>Prev</button>
        <span>Page {page + 1}</span>
        <button onClick={nextPage} disabled={!hasMore || isLoading}>Next</button>
        </div>
    );

    console.log("Final Average Price:", averagePrice);

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
            <Link to='/view-statistics' className='view-statistics' >
                <CustomButton label="View statistics" className="view-statistics-button" />
            </Link>
            <Link to='/scroll-hotels' className='scroll-hotels-link'>
                <CustomButton label="Scroll Hotels (Infinite)" className="scroll-hotels-button" />
            </Link>
            <div className='sort-hotels'>
                <CustomButton label="Sort by number of stars" className="sort-button" onClick={sortHotelsByStars} />
            </div>
            <div className='generate-toggle'>
                <CustomButton
                    label={isGenerating ? "Stop Generating Hotels" : "Start Generating Hotels"}
                    className="toggle-generation-button"
                    onClick={toggleGeneration}
                />
            </div>


            <div className="items-per-page">
                <label>Hotels per page: </label>
                <select value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                </select>
            </div>

            <div className='legend'>
                <div><u>Legend</u></div> 
                <div style={{color: "#CD7F32"}}>Bronze - cheap</div>
                <div style={{color: "silver"}}>Silver - average</div>
                <div style={{color: "gold"}}>Gold - expensive</div>
            </div>
            
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
                <div>
                    {/* ... header, filters, search input, etc. */}
                    <div className="hotel-list">
                        {filteredHotels.map((hotel) => (
                        <HotelCard key={hotel.name} hotel={hotel} />
                        ))}
                    </div>
                    {renderPagination()}
                </div>
            </div>
        </div>
    );
}

HomePage.propTypes = {
    filtersList: PropTypes.array.isRequired,
    hotelsList: PropTypes.arrayOf(PropTypes.instanceOf(Object)).isRequired,
    isGenerating: PropTypes.bool.isRequired,
    toggleGeneration: PropTypes.func.isRequired,
      loadMoreHotels: PropTypes.func.isRequired
};

export default HomePage