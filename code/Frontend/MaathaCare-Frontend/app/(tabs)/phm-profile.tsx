import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

const API_BASE_URL = "http://172.20.10.2:8080";

export default function PHMProfileScreen() {
  const [phmInfo, setPhmInfo] = useState<any>(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPHMData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;

        // Fetch Profile
        const profileRes = await fetch(`${API_BASE_URL}/api/phm/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.ok) setPhmInfo(await profileRes.json());

        // Fetch Appointments
        const appointRes = await fetch(`${API_BASE_URL}/api/appointments/phm`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (appointRes.ok) setAppointments(await appointRes.json());

      } catch (error) {
        Alert.alert("Connection Error", "Check your backend and IP address.");
      } finally {
        setLoading(false);
      }
    };
    fetchPHMData();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />;

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.headerCard}>
        <Text style={styles.label}>STAFF IDENTITY</Text>
        <Text style={styles.name}>{phmInfo?.fullName || "Not Found"}</Text>
        <Text style={styles.subText}>ID: {phmInfo?.registrationNumber}</Text>
        <Text style={styles.subText}>Area: {phmInfo?.mohArea}</Text>
      </View>

      {/* Dynamic Appointment List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        {appointments.length > 0 ? (
          appointments.map((item: any) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.dateText}>
                {new Date(item.appointmentDate).toLocaleDateString()} - {item.status}
              </Text>
              <Text style={styles.location}>{item.location}</Text>
              <Text style={styles.remarks}>Notes: {item.remarks || "No notes"}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No appointments found in database.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  loader: { marginTop: 100 },
  headerCard: { backgroundColor: '#4CAF50', padding: 25, borderRadius: 20, marginBottom: 25 },
  label: { color: '#E8F5E9', fontSize: 10, fontWeight: 'bold' },
  name: { fontSize: 26, color: 'white', fontWeight: 'bold', marginVertical: 10 },
  subText: { color: 'white', fontSize: 14, opacity: 0.9 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2 },
  dateText: { color: '#4CAF50', fontWeight: 'bold', marginBottom: 5 },
  location: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  remarks: { fontSize: 13, color: '#64748B', marginTop: 5 },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 20 }
});