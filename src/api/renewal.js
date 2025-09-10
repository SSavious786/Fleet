import api from './client';

export async function getUserRenewals(userId) {
  const response = await api.get(`/renewals/user/${userId}`);
  return response.data; // Should be an array of assets
}

export async function createRenewal(userId, data) {
    const response = await api.post(`/renewals?userId=${userId}`, data, {
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

export async function updateRenewal(renewalId, userId, data) {
    const response = await api.put(`/renewals/${renewalId}?userId=${userId}`, data, {
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

export async function deleteRenewalById(renewalId) {
  const response = await api.delete(`/renewals/${renewalId}`);
  return response.data;
}