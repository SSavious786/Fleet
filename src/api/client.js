import axios from 'axios';

const api = axios.create({
  //baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5065/api',
  baseURL: 'https://mytrackio.com/api',
  timeout: 10000,
});

export const mapApi = axios.create({
  //baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5065/api',
  baseURL: 'https://mytrackio.com/api',
  timeout: 10000,
});

export default api; 