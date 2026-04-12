// The API base URL. Set REACT_APP_API_URL in your .env for local dev.
// Example local:      REACT_APP_API_URL=http://localhost:8080/api

let apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

if (window.location.hostname === 'antiprocrastination.xyz' || window.location.hostname.endsWith('.antiprocrastination.xyz')) {
    apiUrl = `https://${window.location.hostname}/api`;
}

export const API_URL = apiUrl;
