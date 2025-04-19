import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

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

            if (!token) {
                throw new Error('No authentication token found');
            }

            const formData = new FormData();
            formData.append('schedule', file);

            console.log('Starting upload...');
            
            const response = await axios.post('http://localhost:4000/api/schedules/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Upload response:', response.data);

            if (response.data && response.data.imageUrl) {
                onUploadSuccess(response.data.imageUrl);
                alert('Schedule uploaded successfully!');
            } else {
                throw new Error('No image URL in response');
            }

        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload schedule: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-section">
            <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                id="schedule-upload"
                style={{ display: 'none' }}
            />
            <label 
                htmlFor="schedule-upload" 
                className="dashboard-upload-btn"
            >
                {uploading ? 'Uploading...' : 'Upload Schedule'}
            </label>
        </div>
    );
};

export default ScheduleUpload;