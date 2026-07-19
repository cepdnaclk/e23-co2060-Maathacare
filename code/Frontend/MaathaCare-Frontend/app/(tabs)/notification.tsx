import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchMotherNotifications, markNotificationAsRead } from '../../api/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of your notification data based on the Spring Boot entity
interface NotificationItem {
    id: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationScreen() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            // Retrieve the logged-in mother's ID and JWT token
            const motherId = await AsyncStorage.getItem('userId'); 
            const token = await AsyncStorage.getItem('jwtToken'); 
            
            if (motherId) {
                const data = await fetchMotherNotifications(motherId, token);
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePress = async (id: string, isRead: boolean) => {
        // If the notification is already read, do nothing
        if (isRead) return;

        try {
            const token = await AsyncStorage.getItem('jwtToken');
            await markNotificationAsRead(id, token);
            
            // Instantly update the UI to remove the blue "unread" highlight
            setNotifications(prev => 
                prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
            );
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const renderItem = ({ item }: { item: NotificationItem }) => (
        <TouchableOpacity 
            style={[styles.card, !item.read && styles.unreadCard]} 
            onPress={() => handlePress(item.id, item.read)}
            activeOpacity={0.7}
        >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            
            {/* Format the timestamp nicely for the UI */}
            <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                })}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList 
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listPadding}
                ListEmptyComponent={
                    <View style={styles.centerContainer}>
                        <Text style={styles.empty}>No new notifications.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8f9fa' 
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50
    },
    listPadding: {
        padding: 16
    },
    card: { 
        backgroundColor: '#ffffff', 
        padding: 16, 
        marginBottom: 12, 
        borderRadius: 12,
        // iOS Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        // Android Shadow
        elevation: 2
    },
    unreadCard: { 
        borderLeftWidth: 5, 
        borderLeftColor: '#007bff', 
        backgroundColor: '#f0f7ff' 
    },
    title: { 
        fontWeight: 'bold', 
        fontSize: 16, 
        color: '#333',
        marginBottom: 6 
    },
    body: { 
        fontSize: 14, 
        color: '#555', 
        marginBottom: 12,
        lineHeight: 20
    },
    date: { 
        fontSize: 12, 
        color: '#888', 
        textAlign: 'right' 
    },
    empty: { 
        fontSize: 16,
        color: '#888' 
    }
});