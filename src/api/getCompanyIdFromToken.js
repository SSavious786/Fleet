import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

export async function getCompanyIdFromToken() {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) throw new Error('No token found');
  try {
    const decoded = jwtDecode(token);
    // CompanyId may be a string or number depending on backend
    return decoded.CompanyId || decoded.companyId || null;
  } catch (e) {
    console.log(e)
    return 'Invalid token';
  }
}

export async function getUserDataFromToken() {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) throw new Error('No token found');
  try {
    const decoded = jwtDecode(token);
    // CompanyId may be a string or number depending on backend
    return decoded || null;
  } catch (e) {
    console.log(e)
    return 'Invalid token';
  }
} 