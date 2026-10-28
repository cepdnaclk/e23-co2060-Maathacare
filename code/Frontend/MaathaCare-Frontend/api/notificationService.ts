import axios from 'axios';



import { API_BASE_URL } from "@/constants/apiConfig";
export const fetchMotherNotifications = async (motherId: string, token: string | null) => {
    const response = await axios.get(`${API_BASE_URL}/mother/${motherId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const markNotificationAsRead = async (notificationId: string, token: string | null) => {
    await axios.put(`${API_BASE_URL}/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
};