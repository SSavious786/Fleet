import api from "./client";
import { getCompanyIdFromToken } from "./getCompanyIdFromToken";

export async function getUsersByCompanyId(userId) {
    const response = await api.get(`/users/company/${userId}`);
    return response.data; // Should be an array of assets
}

export async function getUsers() {
    return getCompanyIdFromToken()
        .then(id => {
            return getUsersByCompanyId(id);
        })
        .catch(err => {
            console.log(err);
        })
}