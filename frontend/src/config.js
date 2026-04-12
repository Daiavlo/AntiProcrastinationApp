// The API base URL. Set REACT_APP_API_URL in your .env for local dev.
// For production (Cloudflare Pages), set this env var in your Cloudflare Pages dashboard.
// Example local:      REACT_APP_API_URL=http://localhost:8080/api
// Example production: REACT_APP_API_URL=https://antiprocrastination.xyz/api
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
