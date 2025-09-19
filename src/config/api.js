// src/config/api.js
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-url.com'
  : 'http://localhost:5000'; // <-- backend on port 5000 per your note

export default API_BASE;
