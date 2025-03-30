import React, { useState } from "react";
import Header from "../../components/Header";
import PropTypes from "prop-types";
import Hotel from "../../types/Hotel";
import { useParams, useNavigate } from "react-router-dom";
import { useDropzone } from 'react-dropzone';
import './styles.css';
import { useEffect } from "react";



const UpdatePage = ({ hotels, onUpdate, allFacilities }) => {
    const navigate = useNavigate();
    const { name } = useParams();
    const hotel = hotels.find((hotel) => hotel.name === name);

    const [formData, setFormData] = useState({
        fname: '',
        nrstars: 0,
        location: '',
        location_maps: '',
        price_per_night: 0,
        description: '',
        facilities: '',
        cover_image: '',
        images: []
    });

    useEffect(() => {
        if (hotel) {
            setFormData({
                fname: hotel.name,
                nrstars: hotel.number_of_stars,
                location: hotel.location,
                location_maps: hotel.location_maps,
                price_per_night: hotel.price_per_night,
                description: hotel.description,
                facilities: hotel.facilities,
                cover_image: hotel.cover_image,
                images: Array.isArray(hotel.images) ? hotel.images : [] // Ensure images is an array
            });
        }
    }, [hotel]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleCheckboxChange = (facility) => {
        setFormData((prevFormData) => {
            const facilities = prevFormData.facilities.includes(facility)
                ? prevFormData.facilities.filter((f) => f !== facility)
                : [...prevFormData.facilities, facility];
            return { ...prevFormData, facilities };
        });
    };

    const handleDropCoverImage = (acceptedFiles) => {
        setFormData({
            ...formData,
            cover_image: URL.createObjectURL(acceptedFiles[0])
        });
    };

    const handleDropImages = (acceptedFiles) => {
        setFormData({
            ...formData,
            images: [...formData.images, ...acceptedFiles.map(file => URL.createObjectURL(file))]
        });
    };

    const handleDeleteImage = (index) => {
        setFormData({
            ...formData,
            images: formData.images.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedHotel = new Hotel(
            formData.fname,
            formData.nrstars,
            formData.location,
            formData.location_maps,
            formData.cover_image,
            formData.images,
            formData.description,
            formData.facilities,
            formData.price_per_night
        );
        onUpdate(updatedHotel);
        navigate(`/hotel/${formData.fname}`);
    };

    const { getRootProps: getRootPropsCoverImage, getInputProps: getInputPropsCoverImage } = useDropzone({
        onDrop: handleDropCoverImage,
        accept: 'image/*',
        multiple: false
    });

    const { getRootProps: getRootPropsImages, getInputProps: getInputPropsImages } = useDropzone({
        onDrop: handleDropImages,
        accept: 'image/*'
    });

    if (!hotel) {
        return <div>Hotel not found</div>;
    }

    return (
        <div>
            <Header />
            <form className="update-form" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="fname" className="label">Hotel name: </label>
                    <input type="text" id="fname" name="fname" className="input" value={formData.fname} />
                </div>
                <div>
                    <label htmlFor="nrstars" className="label">Number of stars: </label>
                    <input type="number" id="nrstars" name="nrstars" className="input" value={formData.nrstars} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="location" className="label">Location: </label>
                    <input type="text" id="location" name="location" className="input" value={formData.location} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="location_maps" className="label">Location maps: </label>
                    <input type="text" id="location_maps" name="location_maps" className="input" value={formData.location_maps} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="price_per_night" className="label">Price per night: </label>
                    <input type="number" id="price_per_night" name="price_per_night" className="input" value={formData.price_per_night} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="description" className="label">Description: </label>
                    <textarea id="description" name="description" className="textarea" value={formData.description} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="facilities" className="label">Facilities: </label>
                    <div className="facilities-list-update">
                        {allFacilities.map((facility) => (
                            <div key={facility} className="facility-item">
                                <input
                                    type="checkbox"
                                    id={facility}
                                    name="facilities"
                                    value={facility}
                                    checked={formData.facilities.includes(facility)}
                                    onChange={() => handleCheckboxChange(facility)}
                                />
                                <label htmlFor={facility}>{facility}</label>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ marginBottom: 30 }}>
                    <label htmlFor="cover_image" className="label">Cover image: </label>
                    <div {...getRootPropsCoverImage({ className: 'dropzone' })}>
                        <input {...getInputPropsCoverImage()} className="input" />
                        <p>Drag & drop a cover image here or click to select a file</p>
                    </div>
                    {formData.cover_image && (
                        <div className="image-item">
                            <p>{formData.cover_image}</p>
                            <div>
                                <button type="button" className={"image-button"} onClick={() => window.open(formData.cover_image, '_blank')}>Open</button>
                                <button type="button" className={"image-button"} onClick={() => setFormData({ ...formData, cover_image: '' })}>Delete</button>
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <label htmlFor="images" className="label">Images: </label>
                    <div {...getRootPropsImages({ className: 'dropzone' })}>
                        <input {...getInputPropsImages()} className="input" />
                        <p>Drag & drop some files here or click to select files</p>
                    </div>
                    <div className="images-preview">
                        {formData.images.map((image, index) => (
                            <div key={index} className="image-item">
                                <p>{image}</p>
                                <div>
                                    <button type="button" className={"image-button"} onClick={() => window.open(image, '_blank')}>Open</button>
                                    <button type="button" className={"image-button"} onClick={() => handleDeleteImage(index)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <input type="submit" value="Submit" className="submit-update" />
            </form>
        </div>
    );
};

UpdatePage.propTypes = {
    hotels: PropTypes.arrayOf(PropTypes.instanceOf(Hotel)).isRequired,
    onUpdate: PropTypes.func.isRequired
};

export default UpdatePage;