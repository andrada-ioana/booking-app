import React from "react";
import './styles.css';
import PropTypes from "prop-types";
import { useState } from "react";

const FilterCard = ({label, icon, options, selectedOptions = [], onSelect}) => {
    const handleChange = (event) => {
        const value = Number(event.target.value);
        let updatedOptions = selectedOptions.map(option => Number(option));

        if (updatedOptions.includes(value)) {
            updatedOptions = updatedOptions.filter((option) => option !== value);
        } else {
            updatedOptions.push(value);
        }

        onSelect && onSelect(updatedOptions);
    };

    return (
        <div className="filter-card">
            <div className="filter-label">
                {icon}
                <text className="filter-label">{label}</text>
            </div>
            {options.map((option) => (
                <div className="filter-option" key={option}>
                    <input type="checkbox" className="filter-checkbox" name={label} value={parseInt(option, 10)} checked={selectedOptions.includes(parseInt(option, 10))} onChange={handleChange} />
                    <label>{option}</label>
                </div>
            ))}
        </div>
    );
};

FilterCard.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.element,
    options: PropTypes.array.isRequired,
    selectedOptions: PropTypes.array.isRequired,
    onSelect: PropTypes.func,
};

export default FilterCard;