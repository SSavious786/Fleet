import api from './client';

export async function getEquipment() {
    try {
        const response = await api.get(`/equipment`);
        return response.data;
    } catch (error) {
        console.log('error', error)
        if (error.response && error.response.data && error.response.data.message) {
            return error.response.data.message;
        }
        return error;
    }
}

export async function getEquipmentByCompanyUser(userId) {
    try {
        const response = await api.get(`/equipment/company?userId=${userId}`);
        return response.data;
    } catch (error) {
        console.log('error', error)
        if (error.response && error.response.data && error.response.data.message) {
            return error.response.data.message;
        }
        return error;
    }
}

export async function getEquipmentByUserId(userIduserId) {
    try {
        const response = await api.get(`/equipment/user?userId=${userIduserId}`);
        return response.data;
    } catch (error) {
        console.log('error', error)
        if (error.response && error.response.data && error.response.data.message) {
            return error.response.data.message;
        }
        return error;
    }
}

export async function createEquipment(userId, data) {
    const response = await api.post(`/equipment?userId=${userId}`, data, {
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
        }
    });
    return response.data; // Should be an array of assets
}

export async function updateEquipment(equipmentId, userId, data) {
    const response = await api.put(`/equipment/${equipmentId}?userId=${userId}`, data, {
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
        }
    });
    return response.data; // Should be an array of assets
}

export async function deleteEquipmentById(equipmentId) {
    try {
        const response = await api.delete(`/equipment/${equipmentId}`);
        return response.data;
    }
    catch (error) {
        console.log(error);
        if (error.response && error.response.data && error.response.data.message) {
            return error.response.data.message;
        }
        return error;
    }
}