// Step:1 Create a custom instance of Axios to handle API requests with base URL, credentials, and headers configuration

import axios from 'axios';

// Create a custom instance of Axios
const api = axios.create({
  // In a real app, this should be in a .env file (e.g., import.meta.env.VITE_API_URL)
  baseURL: 'http://localhost:8000/api/v1',
  // VERY IMPORTANT: Tells browser to send our HttpOnly cookies (Refresh Token) with every request
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
