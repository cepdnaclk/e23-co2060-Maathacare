import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE_URL = "http://192.168.131.223:8080";

export default function PHMDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [phmInfo, setPhmInfo] = useState<any>(null);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState<'Home' | 'Appointment' | 'Profile'>('Home');

  const [searchNic, setSearchNic] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMother, setSelectedMother] = useState<any>(null);
  const [date, setDate] = useState(new Date());
  const [remarks, setRemarks] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, []),
  );

  const loadDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const profileRes = await fetch(`${API_BASE_URL}/api/phm/me`, { headers });
      if (profileRes.ok) setPhmInfo(await profileRes.json());

      const patientsRes = await fetch(`${API_BASE_URL}/api/phm/patients`, { headers });
      if (patientsRes.ok) setPatients(await patientsRes.json());
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
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
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

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/");
  };

  const handleSaveAppointment = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const payload = {
      mother: { id: selectedMother.id },
      phm: { id: phmInfo.id },
      appointmentDate: date.toISOString(),
      status: "SCHEDULED",
      remarks: remarks,
      location: phmInfo.mohArea || "Health Center",
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }
    const currentDate = selectedDate || date;
    setDate(currentDate);

    if (Platform.OS === "android") {
      setShowPicker(false);
      if (pickerMode === "date") {
        setTimeout(() => {
          setPickerMode("time");
          setShowPicker(true);
        }, 100);
      }
    }
  };

  // --- RENDERING COMPONENTS ---

  const renderHome = () => (
    <View style={styles.contentSection}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter Mother's NIC..."
          placeholderTextColor="#94A3B8"
          value={searchNic}
          onChangeText={setSearchNic}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAssignMother}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Your Patient List ({patients.length})</Text>
      <FlatList
        data={patients}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={styles.patientCard}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => router.push({ pathname: "/mother_details" as any, params: { motherId: item.user?.userId } })}
            >
              <Text style={styles.patientName}>{item.fullName}</Text>
              <Text style={styles.patientDetails}>NIC: {item.nic}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.scheduleBtn}
              onPress={() => router.push({ pathname: "/mother_details" as any, params: { motherId: item.user?.userId } })}
            >
              <Text style={styles.scheduleBtnText}>👤</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );

  const renderProfile = () => (
    <View style={styles.contentSection}>
      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Full Name</Text>
        <Text style={styles.profileValue}>{phmInfo?.fullName || "Staff Member"}</Text>
        <Text style={styles.profileLabel}>PHM ID</Text>
        <Text style={styles.profileValue}>{phmInfo?.staffId || "N/A"}</Text>
        <Text style={styles.profileLabel}>Phone Number</Text>
        <Text style={styles.profileValue}>{phmInfo?.phoneNumber || "Not Set"}</Text>
        <Text style={styles.profileLabel}>District / Area</Text>
        <Text style={styles.profileValue}>{phmInfo?.mohArea}</Text>
      </View>
      <TouchableOpacity style={styles.changePassBtn} onPress={() => router.push("/phm/change-password" as any)}>
        <Text style={styles.changePassText}>🔑 Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtnLarge} onPress={handleLogout}>
        <Text style={styles.logoutTextLarge}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAppointments = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Select Mother to Schedule Appointment</Text>
      <FlatList
        data={patients}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={styles.patientCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{item.fullName}</Text>
              <Text style={styles.patientDetails}>NIC: {item.nic}</Text>
            </View>
            <TouchableOpacity
              style={[styles.scheduleBtn, { backgroundColor: '#E0F2FE' }]}
              onPress={() => {
                setSelectedMother(item);
                setModalVisible(true);
              }}
            >
              <Text style={styles.scheduleBtnText}>📅</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No patients available for scheduling.</Text>}
      />
    </View>
  );

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0056b3" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0056b3" />
      <View style={styles.header}>
        <Text style={styles.portalLabel}>PHM PORTAL</Text>
        <Text style={styles.headerTitle}>{phmInfo?.fullName}</Text>
        <Text style={styles.headerSubtitle}>ID: {phmInfo?.staffId}</Text>
      </View>
      <View style={{ flex: 1 }}>
        {activeTab === 'Home' && renderHome()}
        {activeTab === 'Appointment' && renderAppointments()}
        {activeTab === 'Profile' && renderProfile()}
      </View>
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => setActiveTab('Home')} style={styles.tabItem}>
          <Text style={[styles.tabIcon, activeTab === 'Home' && styles.activeTab]}>🏠</Text>
          <Text style={[styles.tabLabel, activeTab === 'Home' && styles.activeTab]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Appointment')} style={styles.tabItem}>
          <Text style={[styles.tabIcon, activeTab === 'Appointment' && styles.activeTab]}>📅</Text>
          <Text style={[styles.tabLabel, activeTab === 'Appointment' && styles.activeTab]}>Appointments</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Profile')} style={styles.tabItem}>
          <Text style={[styles.tabIcon, activeTab === 'Profile' && styles.activeTab]}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'Profile' && styles.activeTab]}>Profile</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Appointment</Text>
            <Text style={styles.modalSub}>Patient: {selectedMother?.fullName}</Text>
            <TouchableOpacity onPress={() => { setPickerMode("date"); setShowPicker(true); }} style={styles.dateSelectorButton}>
              <Text style={styles.dateSelectorText}>
                {`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} at ${String(date.getHours() % 12 || 12).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")} ${date.getHours() >= 12 ? "PM" : "AM"}`}
              </Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={date}
                mode={pickerMode}
                is24Hour={false}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeDate}
              />
            )}
            <TextInput
              style={styles.modalInput}
              placeholder="Reason (e.g. Monthly Checkup)"
              placeholderTextColor="#94A3B8"
              value={remarks}
              onChangeText={setRemarks}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalBtn, { backgroundColor: "#F1F5F9" }]}>
                <Text style={{ color: "#475569", fontWeight: "bold" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveAppointment} style={[styles.modalBtn, { backgroundColor: "#0056b3" }]}>
                <Text style={{ color: "white", fontWeight: "bold" }}>Confirm</Text>
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
  header: { backgroundColor: "#0056b3", padding: 25, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, alignItems: 'center' },
  portalLabel: { color: "#BBDEFB", fontSize: 10, fontWeight: "bold", marginBottom: 5 },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "bold" },
  headerSubtitle: { color: "#E3F2FD", fontSize: 13 },
  contentSection: { flex: 1, padding: 20 },
  searchSection: { flexDirection: "row", gap: 10, marginBottom: 20 },
  searchInput: { flex: 1, backgroundColor: "white", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  addBtn: { backgroundColor: "#0056b3", paddingHorizontal: 15, borderRadius: 10, justifyContent: 'center' },
  addBtnText: { color: "white", fontWeight: "bold" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12, color: "#1E293B" },
  patientCard: { backgroundColor: "white", padding: 18, borderRadius: 15, marginBottom: 10, flexDirection: "row", alignItems: "center", elevation: 2 },
  patientName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  patientDetails: { fontSize: 13, color: "#64748B", marginTop: 4 },
  scheduleBtn: { backgroundColor: "#F1F5F9", padding: 10, borderRadius: 10 },
  scheduleBtnText: { fontSize: 18 },
  profileCard: { backgroundColor: "white", padding: 20, borderRadius: 15, elevation: 3 },
  profileLabel: { color: "#64748B", fontSize: 12, fontWeight: "bold", marginTop: 10 },
  profileValue: { fontSize: 17, color: "#1E293B", fontWeight: "500" },
  changePassBtn: { marginTop: 20, backgroundColor: "#F1F5F9", padding: 15, borderRadius: 12, alignItems: 'center' },
  changePassText: { color: "#0056b3", fontWeight: "bold" },
  logoutBtnLarge: { marginTop: 15, backgroundColor: "#FEE2E2", padding: 15, borderRadius: 12, alignItems: 'center' },
  logoutTextLarge: { color: "#B91C1C", fontWeight: "bold" },
  tabBar: { flexDirection: "row", height: 75, backgroundColor: "white", borderTopWidth: 1, borderColor: "#E2E8F0", paddingBottom: 10 },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabIcon: { fontSize: 22, color: "#94A3B8" },
  tabLabel: { fontSize: 11, color: "#94A3B8", marginTop: 4 },
  activeTab: { color: "#0056b3", fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "white", borderRadius: 20, padding: 25, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1E293B" },
  modalSub: { color: "#64748B", marginBottom: 20 },
  dateSelectorButton: { backgroundColor: "#EFF6FF", padding: 15, borderRadius: 10, borderWidth: 1, borderColor: "#BFDBFE", marginBottom: 15 },
  dateSelectorText: { fontSize: 15, color: "#1D4ED8", fontWeight: "bold", textAlign: 'center' },
  modalInput: { backgroundColor: "#F8FAFC", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20, color: '#333' },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 40 }
});