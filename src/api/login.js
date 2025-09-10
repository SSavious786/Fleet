import api from './client';

export async function login(email, password) {
  try {
    const response = await api.post('/AuthApi/login', { email, password });
    return response.data.token;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Login failed. Please try again.');
  }
} 