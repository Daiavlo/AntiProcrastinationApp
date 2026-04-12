// The API base URL. Set REACT_APP_API_URL in your .env for local dev.
// Example local:      REACT_APP_API_URL=http://localhost:8080/api

let apiUrl = process.env.REACT_APP_API_URL || 'https://api.antiprocrastination.xyz/api';

console.log('Detected Hostname:', window.location.hostname);

if (window.location.hostname === 'antiprocrastination.xyz' || window.location.hostname.endsWith('.antiprocrastination.xyz')) {
    apiUrl = `https://api.antiprocrastination.xyz/api`;
}

console.log('Final API URL:', apiUrl);

export const API_URL = apiUrl;
