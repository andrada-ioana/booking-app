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
    const [videoMarkedForDeletion, setVideoMarkedForDeletion] = useState(false);

    const [formData, setFormData] = useState({
        fname: '',
        nrstars: 0,
        location: '',
        location_maps: '',
        price_per_night: 0,
        description: '',
        facilities: [],
        cover_image: '',
        images: [],
        video_url: '',
        video: '',
        videoFile: null
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
                facilities: Array.isArray(hotel.facilities)
                ? hotel.facilities.map(f => f.name)
                : [],
                cover_image: hotel.cover_image,
                images: Array.isArray(hotel.images) ? hotel.images : [], // Ensure images is an array
                video_url: hotel.video_url || '',
                video: hotel.video || '',
                videoFile: null
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

    const handleCheckboxChange = (facilityName) => {
        setFormData((prevFormData) => {
            const facilities = prevFormData.facilities.includes(facilityName)
                ? prevFormData.facilities.filter((f) => f !== facilityName)
                : [...prevFormData.facilities, facilityName];
            return { ...prevFormData, facilities };
        });
    };

    const handleDropCoverImage = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        const form = new FormData();
        form.append('cover', file);
      
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/hotels/${formData.fname}/cover-image`, {
          method: 'POST',
          body: form
        });
      
        const data = await res.json();
        if (!data.imageUrl) {
          console.error('Invalid response:', data);
          return;
        }
      
        setFormData((prev) => ({ ...prev, cover_image: data.imageUrl }));
    };
      
      
    const handleDropImages = async (acceptedFiles) => {
        const form = new FormData();
        acceptedFiles.forEach(file => form.append('images', file));
      
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/hotels/${formData.fname}/images`, {
          method: 'POST',
          body: form
        });
      
        const data = await res.json();
        if (!Array.isArray(data.imageUrls)) {
          console.error('Invalid response:', data);
          return;
        }
      
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...data.imageUrls]
        }));
    };
      
      
    const handleDeleteImage = async (index) => {
        const image = formData.images[index];
      
        try {
          // Send DELETE request to backend (assumes image_url contains the filename)
          const filename = image.image_url.split('/').pop(); // e.g., "1714643541532-photo.jpg"
      
          await fetch(`${process.env.REACT_APP_API_URL}/api/hotels/${formData.fname}/images/${filename}`, {
            method: 'DELETE',
          });
      
          // Remove from state
          setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
          }));
        } catch (error) {
          console.error('Failed to delete image:', error);
        }
    };
      

    const handleDeleteVideo = () => {
        setFormData((prev) => ({
          ...prev,
          video_url: '',
          videoFile: null
        }));
        setVideoMarkedForDeletion(true);
    };
      

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (videoMarkedForDeletion && hotel.video_url && !formData.videoFile) {
            try {
              await fetch(`${process.env.REACT_APP_API_URL}/api/hotels/${hotel.name}/video`, {
                method: 'DELETE',
              });
            } catch (err) {
              console.error("Failed to delete video on server:", err);
            }
        }

        const updatedHotel = new Hotel(
            formData.fname,
            formData.nrstars,
            formData.location,
            formData.location_maps,
            formData.cover_image,
            formData.images,
            formData.description,
            formData.facilities,
            formData.price_per_night,
            "",
            formData.videoFile ? "" : formData.video_url
        );
        updatedHotel.videoFile = formData.videoFile;
        await onUpdate(updatedHotel);
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

    const { getRootProps: getRootPropsVideo, getInputProps: getInputPropsVideo } = useDropzone({
        onDrop: (acceptedFiles) => {
          if (acceptedFiles.length > 0) {
            setFormData((prev) => ({ ...prev, videoFile: acceptedFiles[0] }));
          }
        },
        accept: {
          'video/mp4': ['.mp4'],
          'video/webm': ['.webm'],
          'video/ogg': ['.ogv']
        },
        multiple: false
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
                            <div key={facility.id} className="facility-item">
                                <input
                                    type="checkbox"
                                    id={facility.name}
                                    name="facilities"
                                    value={facility.name}
                                    checked={formData.facilities.includes(facility.name)}
                                    onChange={() => handleCheckboxChange(facility.name)}
                                />
                                <label htmlFor={facility.name}>{facility.name}</label>
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
                                <p>{image.image_url}</p>
                                <div>
                                    <button type="button" className={"image-button"} onClick={() => window.open(image.image_url, '_blank')}>Open</button>
                                    <button type="button" className={"image-button"} onClick={() => handleDeleteImage(index)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="label">Video:</label>
                    <div {...getRootPropsVideo({ className: "dropzone" })}>
                        <input {...getInputPropsVideo()} />
                        <p>Drag & drop a video or click to select</p>
                    </div>

                    {formData.videoFile && (
                        <div className="video-preview">
                        <p>Selected video: {formData.videoFile.name}</p>
                        <video width="320" height="240" controls>
                            <source src={URL.createObjectURL(formData.videoFile)} type="video/mp4" />
                        </video>
                        <div style={{ marginTop: 10 }}>
                            <button type="button" className="image-button" onClick={handleDeleteVideo}>
                            Delete Video
                            </button>
                        </div>
                        </div>
                    )}

                    {!formData.videoFile && formData.video_url && (
                        <div className="video-preview">
                        <p>Current video:</p>
                        <video width="320" height="240" controls>
                            <source src={formData.video_url} type="video/mp4" />
                        </video>
                        <div style={{ marginTop: 10 }}>
                            <button type="button" className="image-button" onClick={handleDeleteVideo}>
                            Delete Video
                            </button>
                        </div>
                        </div>
                    )}
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