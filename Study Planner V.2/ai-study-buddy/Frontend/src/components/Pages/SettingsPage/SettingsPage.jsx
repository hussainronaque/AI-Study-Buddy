import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SettingsPage.css';
import { useAuth } from '../../../context/AuthContext';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [theme, setTheme] = useState({
        sidebarColor: '#42006C',
        backgroundColor: '#f4f6fa'
    });
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/settings/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data) {
                    setTheme({
                        sidebarColor: response.data.sidebarColor,
                        backgroundColor: response.data.backgroundColor
                    });
                    // Apply theme changes
                    document.documentElement.style.setProperty('--sidebar-color', response.data.sidebarColor);
                    document.documentElement.style.setProperty('--background-color', response.data.backgroundColor);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
            setLoading(false);
        };

        if (user?.id && token) {
            fetchSettings();
        }
    }, [user?.id, token]);

    const handleThemeChange = (type, color) => {
        const newTheme = { ...theme, [type]: color };
        setTheme(newTheme);
        
        // Apply theme changes immediately
        if (type === 'sidebarColor') {
            document.documentElement.style.setProperty('--sidebar-color', color);
        } else if (type === 'backgroundColor') {
            document.documentElement.style.setProperty('--background-color', color);
        }
    };

    const handleSaveSettings = async () => {
        try {
            if (!user?.id) {
                throw new Error('User ID is not available');
            }

            if (!token) {
                throw new Error('Authentication token is not available');
            }

            console.log('Saving settings with data:', {
                userId: user.id,
                theme,
                token: token ? 'Token exists' : 'No token'
            });

            const response = await axios.put(
                `http://localhost:4000/api/settings/${user.id}`,
                {
                    backgroundColor: theme.backgroundColor,
                    sidebarColor: theme.sidebarColor
                },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Save settings response:', response.data);
            setSaveStatus('Settings saved successfully!');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            setSaveStatus(`Error saving settings: ${error.response?.data?.message || error.message}`);
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    return (
        <main className='main'>
            <div className="settings-container">
                <h1>Settings</h1>
                
                <div className="settings-section">
                    <h2>User Information</h2>
                    <div className="user-info">
                        <p><strong>Username:</strong> {user?.username || 'Loading...'}</p>
                        <p><strong>Email:</strong> {user?.email || 'Loading...'}</p>
                    </div>
                </div>

                <div className="settings-section">
                    <h2>Theme Customization</h2>
                    
                    <div className="theme-option">
                        <label htmlFor="sidebarColor">Sidebar Color:</label>
                        <input
                            type="color"
                            id="sidebarColor"
                            value={theme.sidebarColor}
                            onChange={(e) => handleThemeChange('sidebarColor', e.target.value)}
                        />
                    </div>

                    <div className="theme-option">
                        <label htmlFor="backgroundColor">Background Color:</label>
                        <input
                            type="color"
                            id="backgroundColor"
                            value={theme.backgroundColor}
                            onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                        />
                    </div>

                    <div className="settings-buttons">
                        <button 
                            className="reset-theme-btn"
                            onClick={() => {
                                const defaultTheme = {
                                    sidebarColor: '#42006C',
                                    backgroundColor: '#f4f6fa'
                                };
                                setTheme(defaultTheme);
                                document.documentElement.style.setProperty('--sidebar-color', defaultTheme.sidebarColor);
                                document.documentElement.style.setProperty('--background-color', defaultTheme.backgroundColor);
                            }}
                        >
                            Reset to Default
                        </button>
                        <button 
                            className="save-settings-btn"
                            onClick={handleSaveSettings}
                        >
                            Save Settings
                        </button>
                    </div>
                    {saveStatus && <p className="save-status">{saveStatus}</p>}
                </div>
            </div>
        </main>
    );
};

export default SettingsPage;