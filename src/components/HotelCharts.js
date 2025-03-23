import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { generateRandomHotels } from "../repository/repository";

const COLORS = ["#FFBB28", "#FF8042", "#00C49F", "#0088FE", "#A28DFF"];

const HotelCharts = ({ hotelsList, styles }) => {
    const [hotelData, setHotelData] = useState(hotelsList);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setHotelData((prevHotels) => {
                const newHotels = generateRandomHotels(2); 
                return [...prevHotels, ...newHotels].slice(-50);
            });
        }, 5000);

        return () => clearInterval(interval); 
    }, []);

    const starsData = [1, 2, 3, 4, 5].map(stars => ({
        stars,
        count: hotelData.filter(h => h.number_of_stars === stars).length
    }));

    const priceRanges = [
        { range: "0-50", min: 0, max: 50 },
        { range: "50-150", min: 50, max: 150 },
        { range: "151-300", min: 151, max: 300 },
        { range: "301-450", min: 301, max: 450 },
        { range: "450+", min: 451, max: Infinity }
    ];

    const priceData = priceRanges.map(({ range, min, max }) => ({
        range,
        count: hotelData.filter(h => h.price_per_night >= min && h.price_per_night <= max).length
    }));

    const priceTrendData = hotelData.slice(-10).map((h, index) => ({
        name: `Hotel ${index + 1}`,
        price: h.price_per_night
    }));

    return (
        <div className={styles}>
            <h2>📊 Hotel Statistics</h2>

            <h3>Hotels per Star Rating</h3>
            <BarChart width={500} height={300} data={starsData}>
                <XAxis dataKey="stars" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>

            <h3>Hotel Price Distribution</h3>
            <PieChart width={500} height={300}>
                <Pie data={priceData} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={100}>
                    {priceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>

            <h3>Hotel Prices Over Time</h3>
            <LineChart width={500} height={300} data={priceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#8884d8" />
            </LineChart>
        </div>
    );
};

export default HotelCharts;
