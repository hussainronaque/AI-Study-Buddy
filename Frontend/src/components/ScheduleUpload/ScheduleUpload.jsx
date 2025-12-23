import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { scheduleApi } from '../../utils/api';
import config from '../../config';
import './ScheduleUpload.css';

const ScheduleUpload = ({ onUploadSuccess }) => {
    const { token } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Reset states
        setUploading(true);
        setError(null);

        try {
            const response = await scheduleApi.uploadSchedule(token, file);
            console.log('Raw upload response:', response); // Debug log

            if (onUploadSuccess && response) {
                const schedule = response.schedule;
                console.log('Schedule from response:', schedule);

                if (!schedule || !schedule.scheduleImage) {
                    throw new Error('No schedule image path in response');
                }

                // Construct the full URL for the image
                const imageUrl = `${config.API_URL}/${schedule.scheduleImage}`;
                console.log('Constructed image URL:', imageUrl);

                onUploadSuccess({
                    imageUrl: imageUrl,
                    schedule: {
                        _id: schedule._id
                    }
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Failed to upload schedule: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="schedule-upload">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="file-input"
                id="schedule-upload-input"
            />
            <label htmlFor="schedule-upload-input" className="upload-label">
                {uploading ? 'Uploading...' : 'Choose Schedule Image'}
            </label>
            {error && <div className="upload-error">{error}</div>}
        </div>
    );
};

export default ScheduleUpload; 