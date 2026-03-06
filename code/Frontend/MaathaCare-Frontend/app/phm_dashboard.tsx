import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PHMDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'appointments'
  const [phmInfo, setPhmInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🎒 Load data from the phone's memory when the screen opens
    loadPHMData();
  }, []);

  const loadPHMData = async () => {
    try {
      const savedRole = await AsyncStorage.getItem("userRole");
      const savedToken = await AsyncStorage.getItem("userToken");

      // Simulated Fetch - Replace with your Spring Boot API call later
      setPhmInfo({
        name: "Kasun Hansika",
        id: "PHM-2026-045",
        phone: "+94 77 123 4567",
        area: "Kandy South",
        role: savedRole
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // 🗑️ Clear the memory and send the user back to the Gateway
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userRole");
    router.replace("/");
  };

  // 🔄 Show a loading spinner until phmInfo is ready
  if (loading || !phmInfo) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Profile Header Section */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          {/* Using ?. to safely access data */}
          <Text style={styles.name}>{phmInfo?.name}</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutSmall}>
            <Text style={styles.logoutSmallText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.areaText}>{phmInfo?.area}</Text>
      </View>

      {/* 2. Navigation Tabs (Personal Details vs Appointments) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'profile' && styles.activeTab]} 
          onPress={() => setActiveTab('profile')}
        >
          <Text style={activeTab === 'profile' ? styles.activeTabText : styles.tabText}>
            Personal Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'appointments' && styles.activeTab]} 
          onPress={() => setActiveTab('appointments')}
        >
          <Text style={activeTab === 'appointments' ? styles.activeTabText : styles.tabText}>
            Appointments
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Conditional Content Area */}
      <ScrollView style={styles.scrollArea}>
        {activeTab === 'profile' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Staff ID: {phmInfo?.id}</Text>
              <Text style={styles.label}>Phone: {phmInfo?.phone}</Text>
              <Text style={styles.label}>Role: {phmInfo?.role}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scheduled Appointments</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Clinic Visit - Mar 20</Text>
              <Text style={styles.label}>Location: Kandy South Clinic</Text>
              <View style={styles.divider} />
              <Text style={styles.cardSub}>Mother: Kumari Silva</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerCard: { 
    backgroundColor: '#4CAF50', 
    padding: 30, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30, 
    paddingTop: 60 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  areaText: { color: '#E8F5E9', fontSize: 16, marginTop: 5 },
  logoutSmall: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 },
  logoutSmallText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  tabContainer: { flexDirection: 'row', padding: 20, gap: 10 },
  tabButton: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center', 
    backgroundColor: '#E2E8F0' 
  },
  activeTab: { backgroundColor: '#4CAF50' },
  tabText: { color: '#64748B', fontWeight: 'bold' },
  activeTabText: { color: 'white', fontWeight: 'bold' },
  scrollArea: { flex: 1 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#1E293B' },
  card: { 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 15, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10 
  },
  label: { fontSize: 16, marginBottom: 8, color: '#334155' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#334155', marginBottom: 5 },
  cardSub: { fontSize: 14, color: '#64748B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 }
});