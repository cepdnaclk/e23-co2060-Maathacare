import React, { useState, useCallback } from 'react'; // 🟢 Added useCallback
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from 'expo-router'; // 🟢 Added to refresh data when you view the tab

export default function HomeTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ weeks: 0, days: 0 });
  const [userName, setUserName] = useState("");

  // 🟢 useFocusEffect ensures that if the date was just updated, 
  // the dashboard shows it immediately when you switch tabs.
  useFocusEffect(
    useCallback(() => {
      const fetchPregnancyData = async () => {
        try {
          const userId = await AsyncStorage.getItem("userId");
          const token = await AsyncStorage.getItem("userToken"); // 🛡️ Get Token

          if (!token || !userId) {
            setLoading(false);
            return;
          }

          const ip = "192.168.1.9"; 
          
          const response = await axios.get(`http://${ip}:8080/api/mothers/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` } // 🛡️ Pass Token
          });

          const data = response.data;
          setUserName(data.fullName ? data.fullName.split(' ')[0] : "Mother");

          // 📅 PREGNANCY CALCULATION LOGIC
          if (data.lastMenstrualPeriod) {
            // Ensure the date string is formatted correctly for JS (YYYY-MM-DD)
            const lmp = new Date(data.lastMenstrualPeriod);
            const today = new Date();
            
            // Calculate total difference in milliseconds
            const diffInMs = today.getTime() - lmp.getTime();
            
            // Convert to total days
            const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            
            console.log("Total days since LMP:", totalDays);

            if (totalDays >= 0) {
              setStats({
                weeks: Math.floor(totalDays / 7),
                days: totalDays % 7
              });
            } else {
              // LMP is in the future
              setStats({ weeks: 0, days: 0 });
            }
          }
        } catch (error) {
          console.error("Dashboard error:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchPregnancyData();
    }, [])
  );

  if (loading) return <ActivityIndicator style={styles.center} color="#FF69B4" />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hello, {userName}!</Text>
        <Text style={styles.subText}>Your pregnancy progress</Text>
      </View>
      <View style={styles.statsCard}>
        <View style={styles.row}>
          <Text style={styles.number}>{stats.weeks}</Text>
          <Text style={styles.unit}> Weeks </Text>
          <Text style={styles.number}>{stats.days}</Text>
          <Text style={styles.unit}> Days</Text>
        </View>
        <Text style={styles.pregnantText}>Pregnant</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: 60, marginBottom: 30 },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#D81B60' },
  subText: { fontSize: 16, color: '#666' },
  statsCard: { backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center', elevation: 4 },
  row: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 10 },
  number: { fontSize: 50, fontWeight: 'bold', color: '#C2185B' },
  unit: { fontSize: 20, color: '#C2185B' },
  pregnantText: { fontSize: 18, color: '#D81B60', fontWeight: '600' }
});