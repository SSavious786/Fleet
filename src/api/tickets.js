import api from "./client";
import { getUserDataFromToken } from "./getCompanyIdFromToken";

export async function getCompanyAssets(userId) {
    const response = await api.get(`/tickets/user/${userId}`);
    return response.data; // Should be an array of assets
}

export async function createTicket(userId, data) {
    const response = await api.post(`/tickets?userId=${userId}`, data, {
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

export async function updateTicket(ticketId, userId, data) {
    const response = await api.put(`/tickets/${ticketId}?userId=${userId}`, data, {
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

export async function deleteTicket(ticketId) {
    const response = await api.delete(`/tickets/${ticketId}`);
    return response.data;
}

export async function getUserTickets() {
    return getUserDataFromToken()
        .then(data => {
            return getCompanyAssets(data.sub);
        })
        .catch(err => {
            console.log(err);
        })
}

