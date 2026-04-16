import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// 🟢 Stable Android API
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

const API_BASE_URL = "http://192.168.131.223:8080";

export default function PHMDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [phmInfo, setPhmInfo] = useState<any>(null);
  const [patients, setPatients] = useState([]);
  const [searchNic, setSearchNic] = useState("");

  // 🟢 Appointment States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMother, setSelectedMother] = useState<any>(null);
  const [date, setDate] = useState(new Date());
  const [remarks, setRemarks] = useState("");

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
        loadDashboardData();
      } else {
        const errorMsg = await response.text();
        Alert.alert("Error", errorMsg);
      }
    } catch (error) {
      console.error("Assignment Error:", error);
    }
  };

  // 🟢 Open Native Android Picker
  const showAndroidPicker = () => {
    // 1. Open Date Picker
    DateTimePickerAndroid.open({
      value: date,
      mode: 'date', // 🟢 Changed from 'datetime'
      display: 'calendar',
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          // 2. Once Date is set, open Time Picker
          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: 'time', // 🟢 Now pick the time
            is24Hour: true,
            onChange: (timeEvent, finalDate) => {
              if (timeEvent.type === 'set' && finalDate) {
                setDate(finalDate); // 🟢 Finally save both to state
              }
            },
          });
        }
      },
    });
  };

  const handleSaveAppointment = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const payload = {
      mother: { id: selectedMother.id },
      phm: { id: phmInfo.id },
      appointmentDate: date.toISOString(),
      status: "SCHEDULED",
      remarks: remarks,
      location: phmInfo.mohArea || "Health Center"
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/schedule`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Alert.alert("Success", "Appointment set successfully!");
        setModalVisible(false);
        setRemarks("");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server.");
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
            <View style={styles.patientCard}>
              <TouchableOpacity 
                style={{ flex: 1 }}
                onPress={() => router.push({ pathname: "/mother_details", params: { motherId: item.user?.userId } })}
              >
                <Text style={styles.patientName}>{item.fullName}</Text>
                <Text style={styles.patientDetails}>NIC: {item.nic} | Blood: {item.bloodGroup}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.scheduleBtn} 
                onPress={() => {
                  setSelectedMother(item);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.scheduleBtnText}>📅</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No patients assigned to you yet.</Text>}
        />
      </View>

      {/* Appointment Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Appointment</Text>
            <Text style={styles.modalSub}>Patient: {selectedMother?.fullName}</Text>

            <TouchableOpacity onPress={showAndroidPicker} style={styles.dateSelector}>
              <Text style={styles.dateText}>{date.toLocaleString()}</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.modalInput}
              placeholder="Reason (e.g. Monthly Checkup)"
              value={remarks}
              onChangeText={setRemarks}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalBtn, { backgroundColor: '#E2E8F0' }]}>
                <Text style={{ color: '#475569' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveAppointment} style={[styles.modalBtn, { backgroundColor: '#0056b3' }]}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  scheduleBtn: { backgroundColor: '#F1F5F9', padding: 10, borderRadius: 10 },
  scheduleBtnText: { fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 25, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  modalSub: { color: '#64748B', marginBottom: 20 },
  dateSelector: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  dateText: { fontSize: 16, color: '#1E293B' },
  modalInput: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 40 }
});