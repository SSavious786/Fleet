import api, { mapApi } from './client';

export async function getAssetMapMarkers(userId) {
  const response = await api.get(`/assets/assets-with-location?userId=${userId}`);
  return response.data; // Should be an array of assets
}