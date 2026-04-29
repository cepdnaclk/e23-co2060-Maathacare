import AsyncStorage from "@react-native-async-storage/async-storage";
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

// 🍎🤖 CROSS-PLATFORM IMPORT
import DateTimePicker from "@react-native-community/datetimepicker";

// ⚠️ UPDATE THIS IP: Make sure this is your current computer Wi-Fi IP address!
const API_BASE_URL = "http://10.224.114.226:8080";

export default function PHMDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [phmInfo, setPhmInfo] = useState<any>(null);
  const [patients, setPatients] = useState([]);
  const [searchNic, setSearchNic] = useState("");

  // Appointment States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMother, setSelectedMother] = useState<any>(null);
  const [date, setDate] = useState(new Date());
  const [remarks, setRemarks] = useState("");

  // 🍎🤖 Cross-Platform Picker States
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

      const profileRes = await fetch(`${API_BASE_URL}/api/phm/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setPhmInfo(profileData);
      }

      const patientsRes = await fetch(`${API_BASE_URL}/api/phm/patients`, {
        headers: { Authorization: `Bearer ${token}` },
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
      Alert.alert("Network Error", "Could not connect to the server.");
    }
  };

  // 🍎🤖 CROSS-PLATFORM PICKER LOGIC
  const onChangeDate = (event: any, selectedDate?: Date) => {
    // If user cancelled on Android, close picker
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }

    const currentDate = selectedDate || date;
    setDate(currentDate);

    // If we are on Android, we need to hide the picker after selection
    // and then pop up the time picker if we just finished picking the date
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

  const openPicker = () => {
    setPickerMode("date");
    setShowPicker(true);
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
      } else {
        Alert.alert("Error", "Failed to schedule appointment.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/");
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0056b3" />
      </View>
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
        <Text style={styles.phmName}>
          {phmInfo?.fullName || "Staff Member"}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 5,
          }}
        >
          <Text style={styles.areaLabel}>
            📍 {phmInfo?.mohArea || "Assigned Area"}
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
            }}
            onPress={() => router.push("/phm/change-password")}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>
              🔑 Change Password
            </Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.sectionTitle}>
          Your Patient List ({patients.length})
        </Text>
        <FlatList
          data={patients}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => (
            <View style={styles.patientCard}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() =>
                  router.push({
                    pathname: "/mother_details",
                    params: { motherId: item.user?.userId },
                  })
                }
              >
                <Text style={styles.patientName}>{item.fullName}</Text>
                <Text style={styles.patientDetails}>
                  NIC: {item.nic} | Blood: {item.bloodGroup}
                </Text>
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
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No patients assigned to you yet.
            </Text>
          }
        />
      </View>

      {/* Appointment Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Appointment</Text>
            <Text style={styles.modalSub}>
              Patient: {selectedMother?.fullName}
            </Text>

            {/* 📅 FIXED: Better styling so it looks like a button, not a text box */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#475569",
                marginBottom: 5,
              }}
            >
              Select Date & Time
            </Text>
            <TouchableOpacity
              onPress={openPicker}
              style={styles.dateSelectorButton}
            >
              <Text style={styles.dateSelectorText}>
                {/* FIXED: Manual formatting that works 100% perfectly on iPhone */}
                {`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} at ${String(date.getHours() % 12 || 12).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")} ${date.getHours() >= 12 ? "PM" : "AM"}`}
              </Text>
              <Text style={{ fontSize: 18 }}>🗓️</Text>
            </TouchableOpacity>

            {/* The Actual Cross-Platform Picker component */}
            {showPicker && (
              <View
                style={
                  Platform.OS === "ios"
                    ? {
                        marginBottom: 15,
                        backgroundColor: "#f8fafc",
                        borderRadius: 10,
                      }
                    : {}
                }
              >
                <DateTimePicker
                  value={date}
                  mode={pickerMode}
                  is24Hour={false}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDate}
                />
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    onPress={() => {
                      if (pickerMode === "date") {
                        setPickerMode("time");
                      } else {
                        setShowPicker(false);
                      }
                    }}
                    style={{
                      padding: 12,
                      alignItems: "center",
                      backgroundColor: "#e2e8f0",
                      borderBottomLeftRadius: 10,
                      borderBottomRightRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: "#0056b3",
                        fontSize: 16,
                      }}
                    >
                      {pickerMode === "date"
                        ? "Next: Set Time"
                        : "Confirm Time"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ✍️ FIXED: Added placeholderTextColor and text color so it is actually visible! */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#475569",
                marginBottom: 5,
                marginTop: 10,
              }}
            >
              Appointment Reason
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Monthly Checkup"
              placeholderTextColor="#94A3B8"
              value={remarks}
              onChangeText={setRemarks}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setShowPicker(false);
                }}
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
                  Confirm & Schedule
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
  header: {
    backgroundColor: "#0056b3",
    padding: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  portalLabel: { color: "#BBDEFB", fontWeight: "bold", fontSize: 12 },
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 10,
  },
  logoutText: { color: "white", fontSize: 12, fontWeight: "bold" },
  welcomeText: { color: "#E3F2FD", fontSize: 16 },
  phmName: { color: "white", fontSize: 28, fontWeight: "bold" },
  areaLabel: { color: "#BBDEFB", fontSize: 14, marginTop: 5 },
  searchSection: { flexDirection: "row", padding: 20, gap: 10 },
  searchInput: {
    flex: 1,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  addBtn: {
    backgroundColor: "#0056b3",
    paddingHorizontal: 15,
    justifyContent: "center",
    borderRadius: 12,
  },
  addBtnText: { color: "white", fontWeight: "bold" },
  listSection: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 15,
  },
  patientCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },
  patientName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  patientDetails: { fontSize: 13, color: "#64748B", marginTop: 4 },
  scheduleBtn: { backgroundColor: "#F1F5F9", padding: 10, borderRadius: 10 },
  scheduleBtnText: { fontSize: 18 },
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
  dateSelector: {
    backgroundColor: "#F8FAFC",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 15,
  },
  dateText: { fontSize: 16, color: "#1E293B" },
  modalInput: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },

  dateSelectorButton: {
    backgroundColor: "#EFF6FF",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateSelectorText: { fontSize: 16, color: "#1D4ED8", fontWeight: "bold" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 40 },
});
