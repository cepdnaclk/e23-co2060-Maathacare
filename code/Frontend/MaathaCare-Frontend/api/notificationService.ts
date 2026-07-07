import axios from 'axios';

// Replace with your actual backend IP address (e.g., http://192.168.1.100:8080)
const BASE_URL = 'http://10.83.10.226:8080/api/notifications'; 

export const fetchMotherNotifications = async (motherId: string, token: string | null) => {
    const response = await axios.get(`${BASE_URL}/mother/${motherId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const markNotificationAsRead = async (notificationId: string, token: string | null) => {
    await axios.put(`${BASE_URL}/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
};