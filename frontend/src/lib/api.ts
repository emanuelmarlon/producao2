import axios from 'axios';

// Use current host in production, or localhost:3000 in development
const isDev = import.meta.env.DEV;
const API_URL = isDev ? `http://${window.location.hostname}:3000` : '';

export const api = axios.create({
    baseURL: API_URL,
});
