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

const API_BASE_URL = "http://10.224.114.226:8080";

export default function PHMDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [phmInfo, setPhmInfo] = useState<any>(null);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState<
    "Home" | "Appointment" | "Profile"
  >("Home");

  // Appointment & Search States
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
      const [profileRes, patientsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/phm/me`, { headers }),
        fetch(`${API_BASE_URL}/api/phm/patients`, { headers }),
      ]);

      if (profileRes.ok) setPhmInfo(await profileRes.json());
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
      const response = await fetch(
        `${API_BASE_URL}/api/phm/assign-mother/${searchNic}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

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

  // --- TAB RENDERING ---

  const renderHome = () => (
    <View style={styles.contentSection}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{patients.length}</Text>
          <Text style={styles.statLabel}>Total Patients</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#059669" }]}>Active</Text>
          <Text style={styles.statLabel}>Service Status</Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter NIC to link mother..."
          placeholderTextColor="#94A3B8"
          value={searchNic}
          onChangeText={setSearchNic}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAssignMother}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Maternal Care List</Text>
      <FlatList
        data={patients}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={styles.patientCard}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() =>
                router.push({
                  pathname: "/mother_details" as any,
                  params: { motherId: item.user?.userId },
                })
              }
            >
              <Text style={styles.patientName}>{item.fullName}</Text>
              <Text style={styles.patientDetails}>
                NIC: {item.nic} • Blood: {item.bloodGroup}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCircle}
              onPress={() =>
                router.push({
                  pathname: "/mother_details" as any,
                  params: { motherId: item.user?.userId },
                })
              }
            >
              <Text style={{ fontSize: 14 }}>👤</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );

  const renderAppointments = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Schedule Checkup</Text>
      <FlatList
        data={patients}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={styles.patientCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{item.fullName}</Text>
              <Text style={styles.patientDetails}>
                Schedule next routine visit
              </Text>
            </View>
            <TouchableOpacity
              style={styles.scheduleBtn}
              onPress={() => {
                setSelectedMother(item);
                setModalVisible(true);
              }}
            >
              <Text style={styles.scheduleBtnText}>📅 Schedule</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No patients assigned to schedule.
          </Text>
        }
      />
    </View>
  );

  const renderProfile = () => (
    <View style={styles.contentSection}>
      <View style={styles.profileAvatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {phmInfo?.fullName?.charAt(0) || "P"}
          </Text>
        </View>
        <Text style={styles.profileMainName}>{phmInfo?.fullName}</Text>
        <Text style={styles.profileMainId}>
          Public Health Midwife • ID: {phmInfo?.staffId}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Assigned Area</Text>
          <Text style={styles.infoValue}>{phmInfo?.mohArea}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone Number</Text>
          <Text style={styles.infoValue}>
            {phmInfo?.phoneNumber || "Not Set"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.changePassBtn}
        onPress={() => router.push("/phm/change-password" as any)}
      >
        <Text style={styles.changePassText}>🔑 Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await AsyncStorage.clear();
          router.replace("/");
        }}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0056b3" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0056b3" />

      <View style={styles.slimHeader}>
        <Text style={styles.headerPortalText}>MAATHACARE PORTAL</Text>
        <Text style={styles.headerLocationText}>📍 {phmInfo?.mohArea}</Text>
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === "Home" && renderHome()}
        {activeTab === "Appointment" && renderAppointments()}
        {activeTab === "Profile" && renderProfile()}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab("Home")}
          style={styles.tabButton}
        >
          <Text
            style={[
              styles.tabIcon,
              activeTab === "Home" && styles.tabActiveText,
            ]}
          >
            🏠
          </Text>
          <Text
            style={[
              styles.tabLabel,
              activeTab === "Home" && styles.tabActiveText,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("Appointment")}
          style={styles.tabButton}
        >
          <Text
            style={[
              styles.tabIcon,
              activeTab === "Appointment" && styles.tabActiveText,
            ]}
          >
            📅
          </Text>
          <Text
            style={[
              styles.tabLabel,
              activeTab === "Appointment" && styles.tabActiveText,
            ]}
          >
            Appointments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("Profile")}
          style={styles.tabButton}
        >
          <Text
            style={[
              styles.tabIcon,
              activeTab === "Profile" && styles.tabActiveText,
            ]}
          >
            👤
          </Text>
          <Text
            style={[
              styles.tabLabel,
              activeTab === "Profile" && styles.tabActiveText,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Appointment</Text>
            <Text style={styles.modalSub}>
              Patient: {selectedMother?.fullName}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setPickerMode("date");
                setShowPicker(true);
              }}
              style={styles.dateSelectorButton}
            >
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
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalBtn, { backgroundColor: "#F1F5F9" }]}
              >
                <Text style={{ color: "#475569", fontWeight: "bold" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveAppointment}
                style={[styles.modalBtn, { backgroundColor: "#0056b3" }]}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Confirm
                </Text>
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
  slimHeader: {
    backgroundColor: "#0056b3",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerPortalText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  headerLocationText: { color: "#BBDEFB", fontSize: 11 },
  contentSection: { flex: 1, padding: 20 },
  statsRow: { flexDirection: "row", gap: 15, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    elevation: 2,
    alignItems: "center",
  },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#0056b3" },
  statLabel: { fontSize: 11, color: "#64748B", marginTop: 4 },
  searchSection: { flexDirection: "row", gap: 10, marginBottom: 20 },
  searchInput: {
    flex: 1,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  addBtn: {
    backgroundColor: "#0056b3",
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
  },
  addBtnText: { color: "white", fontWeight: "bold" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 15,
  },
  patientCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  patientName: { fontSize: 15, fontWeight: "bold", color: "#334155" },
  patientDetails: { fontSize: 12, color: "#64748B", marginTop: 2 },
  actionCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleBtn: {
    backgroundColor: "#0056b3",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  scheduleBtnText: { color: "white", fontSize: 12, fontWeight: "bold" },
  profileAvatarSection: { alignItems: "center", marginVertical: 20 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0056b3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { color: "white", fontSize: 32, fontWeight: "bold" },
  profileMainName: { fontSize: 24, fontWeight: "bold", color: "#1E293B" },
  profileMainId: { fontSize: 13, color: "#64748B" },
  infoCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoLabel: { color: "#64748B", fontSize: 13 },
  infoValue: { fontWeight: "bold", fontSize: 13, color: "#1E293B" },
  tabBar: {
    flexDirection: "row",
    height: 75,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    paddingBottom: 10,
  },
  tabButton: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabIcon: { fontSize: 20, color: "#94A3B8" },
  tabLabel: { fontSize: 10, color: "#94A3B8", marginTop: 4 },
  tabActiveText: { color: "#0056b3", fontWeight: "bold" }, // 🟢 Matches what you use in TabBar
  changePassBtn: {
    marginTop: 20,
    backgroundColor: "#F1F5F9",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  changePassText: { color: "#0056b3", fontWeight: "bold" },
  logoutBtn: {
    marginTop: 15,
    backgroundColor: "#FEE2E2",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: { color: "#B91C1C", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1E293B" },
  modalSub: { color: "#64748B", marginBottom: 20 },
  dateSelectorButton: {
    backgroundColor: "#EFF6FF",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 15,
  },
  dateSelectorText: {
    fontSize: 15,
    color: "#1D4ED8",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    color: "#333",
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 40 },
});
