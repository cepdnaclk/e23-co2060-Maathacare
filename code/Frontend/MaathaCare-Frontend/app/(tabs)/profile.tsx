import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        // Make sure this IP matches your current hotspot/network IP!
        const response = await axios.get(`http://172.20.10.4:8080/api/mothers/profile/${userId}`);
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#FF69B4" style={styles.centered} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mother's Profile</Text>
      <View style={styles.card}>
        <DetailItem label="Full Name" value={profile?.fullName} />
        <DetailItem label="NIC Number" value={profile?.nic} />
        <DetailItem label="Emergency Contact" value={profile?.emergencyContactNumber} />
        <DetailItem label="Home Address" value={profile?.address} />
        <DetailItem label="Blood Group" value={profile?.bloodGroup} />
        </View>
    </ScrollView>
  );
}

const DetailItem = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.itemContainer}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "Not provided"}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf2f8', padding: 20 },
  centered: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#db2777', marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  itemContainer: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10 },
  label: { fontSize: 14, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' },
  value: { fontSize: 18, color: '#374151', marginTop: 4 }
});