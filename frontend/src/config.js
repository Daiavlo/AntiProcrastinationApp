let apiUrl = process.env.REACT_APP_API_URL || 'https://api.antiprocrastination.xyz/api';

// FORCE OVERRIDE for production
if (window.location.hostname === 'antiprocrastination.xyz' || 
    window.location.hostname === 'www.antiprocrastination.xyz' ||
    window.location.hostname.endsWith('.antiprocrastination.xyz')) {
    apiUrl = 'https://api.antiprocrastination.xyz/api';
}

console.log('--- API DEBUG ---');
console.log('Hostname:', window.location.hostname);
console.log('Resolved API URL:', apiUrl);

export const API_URL = apiUrl;
