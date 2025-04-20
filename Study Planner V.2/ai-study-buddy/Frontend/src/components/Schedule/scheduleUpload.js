import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { scheduleApi } from '../../utils/api';
import './scheduleUpload.css';

const ScheduleUpload = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const { token } = useAuth();

    const handleUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            
            if (!file) {
                throw new Error('No file selected');
            }

            const response = await scheduleApi.uploadSchedule(token, file);

            if (response) {
                onUploadSuccess({
                    imageUrl: response.schedule.scheduleImage,
                    schedule: response.schedule
                });
                alert('Schedule uploaded successfully!');
            } else {
                throw new Error('No response data received');
            }

        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload schedule: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="schedule-upload-container">
            <div className="upload-section">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    id="schedule-upload"
                    className="upload-input"
                />
                <label 
                    htmlFor="schedule-upload" 
                    className={`upload-label ${uploading ? 'uploading' : ''}`}
                >
                    {uploading ? 'Uploading...' : 'Upload Schedule'}
                </label>
            </div>
        </div>
    );
};

export default ScheduleUpload;