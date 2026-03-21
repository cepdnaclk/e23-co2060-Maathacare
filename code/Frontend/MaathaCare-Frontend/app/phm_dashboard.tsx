import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert // 🟢 Added
  ,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput, // 🟢 Added
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE_URL = "http://10.163.129.223:8080";

export default function PHMDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [phmInfo, setPhmInfo] = useState<any>(null);
  const [patients, setPatients] = useState([]);
  const [searchNic, setSearchNic] = useState(""); // 🟢 State for search

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/");
        return;
      }
      
      const profileRes = await fetch(`${API_BASE_URL}/api/phm/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setPhmInfo(profileData);
      }

      const patientsRes = await fetch(`${API_BASE_URL}/api/phm/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatients(patientsData);
      }

    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 NEW: Function to link a mother using her NIC
  const handleAssignMother = async () => {
    if (!searchNic) return;
    const token = await AsyncStorage.getItem("userToken");
    try {
      const response = await fetch(`${API_BASE_URL}/api/phm/assign-mother/${searchNic}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        Alert.alert("Success", "Mother added to your list!");
        setSearchNic("");
        loadDashboardData(); // Refresh the list
      } else {
        const errorMsg = await response.text();
        Alert.alert("Error", errorMsg);
      }
    } catch (error) {
      console.error("Assignment Error:", error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/");
  };

  if (loading) return (
    <View style={styles.centered}><ActivityIndicator size="large" color="#0056b3" /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0056b3" />
      
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.portalLabel}>PHM PORTAL</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.phmName}>{phmInfo?.fullName || "Staff Member"}</Text>
        <Text style={styles.areaLabel}>📍 {phmInfo?.mohArea || "Assigned Area"}</Text>
      </View>

      {/* 🟢 MODIFIED: Added Search Input to link existing mothers */}
      <View style={styles.searchSection}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Enter Mother's NIC to add..."
          value={searchNic}
          onChangeText={setSearchNic}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAssignMother}>
          <Text style={styles.addBtnText}>Add to List</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Your Patient List ({patients.length})</Text>
        <FlatList
          data={patients}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => (
            <TouchableOpacity 
              style={styles.patientCard}
              onPress={() => router.push({ pathname: "/mother_details", params: { motherId: item.user?.userId } })}
            >
              <View>
                <Text style={styles.patientName}>{item.fullName}</Text>
                <Text style={styles.patientDetails}>NIC: {item.nic} | Blood: {item.bloodGroup}</Text>
              </View>
              <Text style={styles.detailLink}>Details →</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No patients assigned to you yet.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#0056b3", padding: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  portalLabel: { color: '#BBDEFB', fontWeight: 'bold', fontSize: 12 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 10 },
  logoutText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  welcomeText: { color: '#E3F2FD', fontSize: 16 },
  phmName: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  areaLabel: { color: '#BBDEFB', fontSize: 14, marginTop: 5 },
  
  searchSection: { flexDirection: 'row', padding: 20, gap: 10 },
  searchInput: { flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  addBtn: { backgroundColor: '#0056b3', paddingHorizontal: 15, justifyContent: 'center', borderRadius: 12 },
  addBtnText: { color: 'white', fontWeight: 'bold' },

  listSection: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  patientCard: { backgroundColor: 'white', padding: 18, borderRadius: 15, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  patientName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  patientDetails: { fontSize: 13, color: '#64748B', marginTop: 4 },
  detailLink: { color: '#0056b3', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 40 }
});