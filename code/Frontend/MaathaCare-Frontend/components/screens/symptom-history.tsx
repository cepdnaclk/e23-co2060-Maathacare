import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/apiConfig'; // Make sure this path is correct

export default function SymptomHistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This runs automatically exactly once when the screen opens
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      
      // Get the logged-in user's ID from storage
      const userId = await AsyncStorage.getItem("userId");
      
      if (!userId) {
        console.error("No user logged in.");
        setIsLoading(false);
        return;
      }

      // Fetch the data from your Spring Boot backend
      const response = await axios.get(`${API_BASE_URL}/api/mothers/symptoms`, {
        params: { userId: userId }
      });

      if (response.status === 200) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to make the Java date look pretty (e.g., "Oct 24, 10:30 AM")
  const formatDateTime = (timestamp: string) => {
    if (!timestamp) return "Unknown Date";
    const dateObj = new Date(timestamp);
    return dateObj.toLocaleString('en-US', {
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your History</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#ED70A1" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.dateText}>{formatDateTime(item.timestamp)}</Text>
              </View>
              
              <Text style={styles.symptomsText}>
                {item.symptoms && item.symptoms.length > 0 
                  ? item.symptoms.join(', ') 
                  : "No symptoms recorded"}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No previous records found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 25, 
    backgroundColor: '#FDF2F8' // Matches your pink app theme
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#ED70A1', 
    marginBottom: 20,
    marginTop: 10
  },
  card: { 
    backgroundColor: 'white', 
    padding: 18, 
    borderRadius: 15, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F9A8D4',
    shadowColor: '#ED70A1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3 
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#FDF2F8',
    paddingBottom: 8,
    marginBottom: 8
  },
  dateText: { 
    fontSize: 14, 
    color: '#888',
    fontWeight: '600'
  },
  symptomsText: { 
    fontSize: 16, 
    color: '#333', 
    fontWeight: '500',
    lineHeight: 22
  },
  emptyContainer: {
    paddingTop: 50,
    alignItems: 'center'
  },
  emptyText: { 
    fontSize: 16,
    color: '#888', 
    fontStyle: 'italic'
  }
});