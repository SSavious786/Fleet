import api from './client';

export async function getDashboardStats(companyId) {
  try {
    const response = await api.get(`/dashboard?companyId=${companyId}`);
    return response.data;
  } catch (error) {
    console.log('error', error.response.data)
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    return 'Failed to fetch dashboard stats. Please try again.';
  }
} 