import React from 'react';
import Header from '../../components/Header';
import PropTypes from 'prop-types';
import HotelCharts from '../../components/HotelCharts';
import './styles.css';

const StatisticsPage = ({hotelsList}) => {

    return (
        <div>
            <Header />
            <HotelCharts hotelsList={hotelsList} styles="body-position" />
        </div>
    );
}

StatisticsPage.propTypes = {
    hotelsList: PropTypes.arrayOf(PropTypes.instanceOf(Object)).isRequired
};

export default StatisticsPage;