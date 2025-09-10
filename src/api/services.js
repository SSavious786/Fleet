import api from './client';

export async function getUserServices(userId) {
  const response = await api.get(`/services/user/${userId}`);
  return response.data; // Should be an array of assets
}

export async function createUserService(userId, data) {
  const response = await api.post(`/services?userId=${userId}`, data, {
    headers: {
      'accept': '*/*',
      'Content-Type': 'application/json'
    }
  });
  return response.data; // Should be an array of assets
}

export async function updateUserService(serviceId, userId, data) {
  const response = await api.put(`/services/${serviceId}?userId=${userId}`, data, {
    headers: {
      'accept': '*/*',
      'Content-Type': 'application/json'
    }
  });
  return response.data; // Should be an array of assets
}

export async function deleteServiceById(serviceId) {
  const response = await api.delete(`/services/${serviceId}`);
  return response.data;
}