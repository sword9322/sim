const API_URL = import.meta.env.VITE_API_URL || 'https://sim-production-4718.up.railway.app';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://sim-production-4718.up.railway.app';

export const getApiUrl = () => API_URL;
export const getBackendUrl = () => BACKEND_URL; 