import api from './client';
import { getCompanyIdFromToken } from './getCompanyIdFromToken';

export async function getCompanyAssets(companyId) {
  const response = await api.get(`/assets?companyId=${companyId}`);
  return response.data; // Should be an array of assets
}

export async function getAllAssets() {
  const response = await api.get(`/assets`);
  return response.data; // Should be an array of assets
}

export async function deleteCompanyAsset(assetId) {
  const response = await api.delete(`/assets/${assetId}`);
  return response.data; // Should be an array of assets
}

export async function getAssetsForDropdown() {
  try {
    const companyId = await getCompanyIdFromToken();
    // const companyAssets = await getCompanyAssets(companyId);
    const companyAssets = await getAllAssets();
    const simplifiedAssets = companyAssets.content.$values.map(({ id, assetName, status, vehicleType }) => ({ id, assetName, status, vehicleType }));
    return await simplifiedAssets;
  }
  catch (err) {
    console.log(err);
    return [];
  }
}

export async function createAsset(assetData) {
  const response = await api.post('/assets', assetData, {
    headers: {
      'accept': '*/*',
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

export async function updateAsset(assetId, assetData) {
  const response = await api.put(`/assets/${assetId}`, assetData, {
    headers: {
      'accept': '*/*',
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

export async function getAssets() {
  try {
    const companyId = await getCompanyIdFromToken();
    // const companyAssets = await getCompanyAssets(companyId);
    const companyAssets = await getAllAssets();
    const simplifiedAssets = companyAssets.content.$values.map(({ id, assetName, status, vehicleType }) => ({ id, assetName, status, vehicleType }));
    return await simplifiedAssets;
  }
  catch (err) {
    console.log(err);
    return [];
  }
}

export async function getLocations() {
  try {
    const companyId = await getCompanyIdFromToken();
    const response = await api.get(`/locations?companyId=${companyId}`);
    const simplifiedAssets = response.data.content.$values.map(({ id, locationName, locationCode, address, city, state, postalCode, country }) => ({ id, locationName, locationCode, address, city, state, postalCode, country }));
    return await simplifiedAssets;
  }
  catch (err) {
    console.log(err);
    return [];
  }
}

export async function getAssetById(assetId) {
  const response = await api.get(`/assets/${assetId}`);
  return response.data;
}