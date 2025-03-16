import React from "react"

const CustomButton = ({label, onClick, disabled = false, className, iconFront, iconBack}) => {
    return (
        <button className={className} onClick={onClick} disabled={disabled}>
            {iconFront && <span className="icon">{iconFront}</span>}
            {label + " "}
            {iconBack && <span className="icon">{iconBack}</span>}
        </button>
    );
};

export default CustomButton;
