const getApiUrl = () => {
    // If the environment variable is explicitly set, use it.
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    
    // In production (Cloudflare), we define the base API URL.
    // Adjust this to "https://api.antiprocrastination.xyz" or "https://antiprocrastination.xyz/api" depending on your Cloudflare routing.
    if (process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost') {
        return 'https://antiprocrastination.xyz/api'; 
    }
    
    // Default fallback for local development
    return 'http://localhost:8080/api';
};

export const API_URL = getApiUrl();
