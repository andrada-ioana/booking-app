import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from 'react-dropzone';
import PropTypes from "prop-types";
import Header from "../../components/Header";
import CustomButton from "../../components/CustomButton";
import Hotel from "../../types/Hotel";
import MessageModal from "../../components/MessageModal";
import "./styles.css";

const AddHotelPage = ({ hotels, onAdd, allFacilities }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fname: "",
        nrstars: "",
        location: "",
        location_maps: "",
        price: "",
        description: "",
        facilities: [],
        cover_image: "",
        images: [],
    });

    const [errors, setErrors] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const validateForm = () => {
        let newErrors = {};

        if (!formData.fname.trim()) {
            newErrors.fname = "Hotel name is required";
        } else if (formData.fname.length > 100) {
            newErrors.fname = "Hotel name must be at most 100 characters";
        }
        else if (hotels.find((hotel) => hotel.name === formData.fname)) {
            newErrors.fname = "Hotel name already exists";
        }

        const stars = parseInt(formData.nrstars, 10);
        if (!stars || stars < 1 || stars > 5) {
            newErrors.nrstars = "Number of stars must be between 1 and 5";
        }

        if (!formData.location.trim()) {
            newErrors.location = "Location is required";
        } else if (formData.location.length > 200) {
            newErrors.location = "Location must be at most 200 characters";
        }

        const price = parseInt(formData.price, 10);
        if (!price || price <= 0) {
            newErrors.price = "Price per night must be a positive number";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        } else if (formData.description.length > 5000) {
            newErrors.description = "Description must be at most 5000 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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
        setFormData({ ...formData, cover_image: URL.createObjectURL(acceptedFiles[0]) });
    };

    const handleDropImages = (acceptedFiles) => {
        setFormData({
            ...formData,
            images: [...formData.images, ...acceptedFiles.map(file => URL.createObjectURL(file))]
        });
    };

    const handleDeleteImage = (index) => {
        setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return; 

        const newHotel = new Hotel(
            formData.fname,
            parseInt(formData.nrstars, 10),
            formData.location,
            formData.location_maps,
            formData.cover_image,
            formData.images,
            formData.description,
            formData.facilities,
            parseInt(formData.price, 10),
        );

        onAdd(newHotel);

        setModalMessage("Hotel successfully added!");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        navigate("/");
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

    return (
        <div>
            <Header />
            <MessageModal isOpen={isModalOpen} onRequestClose={closeModal} message={modalMessage} />
            <form className="add-form" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="fname" className="label">Hotel name: </label>
                    <input type="text" id="fname" name="fname" className="input" value={formData.fname} onChange={handleChange} />
                    {errors.fname && <p className="error">{errors.fname}</p>}
                </div>

                <div>
                    <label htmlFor="nrstars" className="label">Number of stars: </label>
                    <input type="number" id="nrstars" name="nrstars" className="input" value={formData.nrstars} onChange={handleChange} />
                    {errors.nrstars && <p className="error">{errors.nrstars}</p>}
                </div>

                <div>
                    <label htmlFor="location" className="label">Location: </label>
                    <input type="text" id="location" name="location" className="input" value={formData.location} onChange={handleChange} />
                    {errors.location && <p className="error">{errors.location}</p>}
                </div>

                <div>
                    <label htmlFor="location_maps" className="label">Location maps: </label>
                    <input type="text" id="location_maps" name="location_maps" className="input" value={formData.location_maps} onChange={handleChange} />
                </div>

                <div>
                    <label htmlFor="price" className="label">Price per night: </label>
                    <input type="number" id="price" name="price" className="input" value={formData.price} onChange={handleChange} />
                    {errors.price && <p className="error">{errors.price}</p>}
                </div>

                <div>
                    <label htmlFor="description" className="label">Description: </label>
                    <textarea id="description" name="description" className="textarea" value={formData.description} onChange={handleChange} />
                    {errors.description && <p className="error">{errors.description}</p>}
                </div>

                <div>
                    <label className="label">Facilities: </label>
                    <div className="facilities-list-add">
                        {allFacilities.map((facility) => (
                            <div key={facility} className="facility-item">
                                <input
                                    type="checkbox"
                                    id={facility}
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

                <input type="submit" value="Add Hotel" className="submit-add" />
            </form>
        </div>
    );
};

AddHotelPage.propTypes = {
    hotels: PropTypes.arrayOf(PropTypes.instanceOf(Hotel)).isRequired,
    onAdd: PropTypes.func.isRequired,
    allFacilities: PropTypes.array.isRequired
};

export default AddHotelPage;
