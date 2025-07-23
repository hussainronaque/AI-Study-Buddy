const config = {
    API_URL: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000/api/test'
        : 'https://backend-self-theta-51.vercel.app',
        
    // Add other configuration variables here
};

export default config; 