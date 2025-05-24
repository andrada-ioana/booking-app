import React, { useState } from "react";
import Header from "../../components/Header";
import PropTypes from "prop-types";
import Hotel from "../../types/Hotel";
import { useParams, useNavigate } from "react-router-dom";
import { useDropzone } from 'react-dropzone';
import './styles.css';
import { useEffect } from "react";



const UpdatePage = ({ selectedHotel, fetchHotelByName, onUpdate, allFacilities }) => {
    const navigate = useNavigate();
    const { name } = useParams();
    const [videoMarkedForDeletion, setVideoMarkedForDeletion] = useState(false);
    const baseUrl = process.env.REACT_APP_API_URL || '';

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
        if (selectedHotel) {
            setFormData({
                fname: selectedHotel.name,
                nrstars: selectedHotel.number_of_stars,
                location: selectedHotel.location,
                location_maps: selectedHotel.location_maps,
                price_per_night: selectedHotel.price_per_night,
                description: selectedHotel.description,
                facilities: Array.isArray(selectedHotel.facilities)
                ? selectedHotel.facilities.map(f => f.name)
                : [],
                cover_image: selectedHotel.cover_image,
                images: Array.isArray(selectedHotel.images) ? selectedHotel.images : [], // Ensure images is an array
                video_url: selectedHotel.video_url || '',
                video: selectedHotel.video || '',
                videoFile: null
            });
        }
    }, [selectedHotel]);

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
      
        try {
          const res = await fetch(`${baseUrl}/api/hotels/${formData.fname}/cover-image`, {
            method: 'POST',
            body: form,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        
          if (!res.ok) {
            throw new Error(`Failed to upload cover image: ${res.status}`);
          }
        
          const data = await res.json();
          if (!data.imageUrl) {
            throw new Error('Invalid response: missing imageUrl');
          }
        
          setFormData((prev) => ({ ...prev, cover_image: data.imageUrl }));
        } catch (err) {
          console.error('Error uploading cover image:', err);
        }
    };
      
      
    const handleDropImages = async (acceptedFiles) => {
        const form = new FormData();
        acceptedFiles.forEach(file => form.append('images', file));
      
        try {
          const res = await fetch(`${baseUrl}/api/hotels/${formData.fname}/images`, {
            method: 'POST',
            body: form,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        
          if (!res.ok) {
            throw new Error(`Failed to upload images: ${res.status}`);
          }
        
          const data = await res.json();
          if (!Array.isArray(data.imageUrls)) {
            throw new Error('Invalid response: missing imageUrls array');
          }
        
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...data.imageUrls.map(url => ({ image_url: url }))]
          }));
        } catch (err) {
          console.error('Error uploading images:', err);
        }
    };
      
      
    const handleDeleteImage = async (index) => {
        const image = formData.images[index];
      
        try {
          // Send DELETE request to backend (assumes image_url contains the filename)
          const filename = image.image_url.split('/').pop(); // e.g., "1714643541532-photo.jpg"
      
          await fetch(`${baseUrl}/api/hotels/${formData.fname}/images/${filename}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}` // Include token in headers
            }
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
        console.log('Submit clicked. Current formData:', formData);

        if (videoMarkedForDeletion && selectedHotel.video_url && !formData.videoFile) {
            console.log('Attempting to delete existing video:', selectedHotel.video_url);
            try {
                await fetch(`${baseUrl}/api/hotels/${selectedHotel.name}/video`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                console.log('Successfully deleted existing video');
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
        console.log('Created updatedHotel object:', updatedHotel);
        console.log('Video file present:', !!updatedHotel.videoFile);
        console.log('Video URL:', updatedHotel.video_url);

        await onUpdate(updatedHotel);
        navigate(`/hotel/${formData.fname}`);
    };

    const { getRootProps: getRootPropsCoverImage, getInputProps: getInputPropsCoverImage } = useDropzone({
        onDrop: handleDropCoverImage,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: false
    });

    const { getRootProps: getRootPropsImages, getInputProps: getInputPropsImages } = useDropzone({
        onDrop: handleDropImages,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: true
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
        maxSize: 100 * 1024 * 1024, // 100MB
        multiple: false
    });
      

    // Helper function to get full URL
    const getFullUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Remove any leading slashes to avoid double slashes
        const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
        return `${baseUrl}/${cleanUrl}`;
    };

    if (!selectedHotel) {
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
                                <button type="button" className={"image-button"} onClick={() => window.open(getFullUrl(formData.cover_image), '_blank')}>Open</button>
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
                                    <button type="button" className={"image-button"} onClick={() => window.open(getFullUrl(image.image_url), '_blank')}>Open</button>
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
                                <source src={getFullUrl(formData.video_url)} type="video/mp4" />
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
    onUpdate: PropTypes.func.isRequired
};

export default UpdatePage;