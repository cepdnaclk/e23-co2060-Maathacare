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

import PhmAppointments from "../../components/PhmAppointments";

import { API_BASE_URL } from "../../constants/apiConfig";

export default function PHMDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [phmInfo, setPhmInfo] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "Home" | "Appointment" | "Profile"
  >("Home");

  // --- Search & Assign State ---
  const [searchNic, setSearchNic] = useState("");
  const [assignModalVisible, setAssignModalVisible] = useState(false);

  // --- Scheduling State ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMothers, setSelectedMothers] = useState<any[]>([]);
  const [isSelectingDate, setIsSelectingDate] = useState(false);
  const [date, setDate] = useState(new Date());
  const [remarks, setRemarks] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time" | "datetime">(
    "date",
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
        setAssignModalVisible(false);
        loadDashboardData();
      } else {
        const errorMsg = await response.text();
        Alert.alert("Error", errorMsg);
      }
    } catch (error) {
      console.error("Assignment Error:", error);
    }
  };

  const toggleMotherSelection = (mother: any) => {
    if (selectedMothers.some((m) => m.id === mother.id)) {
      setSelectedMothers(selectedMothers.filter((m) => m.id !== mother.id));
    } else {
      setSelectedMothers([...selectedMothers, mother]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedMothers.length === patients.length) {
      setSelectedMothers([]);
    } else {
      setSelectedMothers([...patients]);
    }
  };

  const handleSaveAppointment = async () => {
    if (selectedMothers.length === 0) return;
    const token = await AsyncStorage.getItem("userToken");

    try {
      const promises = selectedMothers.map((mother) => {
        const payload = {
          mother: { id: mother.id },
          phm: { id: phmInfo.id },
          appointmentDate: date.toISOString(),
          status: "SCHEDULED",
          remarks: remarks || "Routine Checkup",
          location: phmInfo.mohArea || "Health Center",
        };

        return fetch(`${API_BASE_URL}/api/appointments/schedule`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      });

      const results = await Promise.all(promises);
      if (results.every((res) => res.ok)) {
        Alert.alert(
          "Success",
          `Scheduled appointments for ${selectedMothers.length} patients!`,
        );
        setModalVisible(false);
        setRemarks("");
        setSelectedMothers([]);
        setIsSelectingDate(false);
        setShowPicker(false);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        Alert.alert("Partial Error", "Some appointments failed to save.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to server.");
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "ios") {
      if (selectedDate) setDate(selectedDate);
    } else {
      if (event.type === "dismissed") {
        setShowPicker(false);
        return;
      }
      if (event.type === "set" && selectedDate) {
        setDate(selectedDate);
      }
      if (pickerMode === "date" && event.type === "set") {
        setShowPicker(false);
        setPickerMode("time");
        setTimeout(() => setShowPicker(true), 100);
      } else if (pickerMode === "time") {
        setShowPicker(false);
      }
    }
  };

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

      <TouchableOpacity
        style={styles.elegantAddBtn}
        onPress={() => setAssignModalVisible(true)}
      >
        <Text style={styles.elegantAddBtnText}>+ Link New Patient</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Maternal Care List</Text>
      <FlatList
        data={patients}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) => item.id.toString()}
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

            <View style={{ flexDirection: "row", gap: 8 }}>
              {/* NEW: View Records Button */}
              <TouchableOpacity
                style={styles.actionCircle}
                onPress={() => {
                  router.push({
                    pathname: "/phm/view-visits" as any,
                    params: { motherId: item.id, motherName: item.fullName },
                  });
                }}
              >
                <Text style={{ fontSize: 14 }}>📊</Text>
              </TouchableOpacity>

              {/* Record Visit Data Button */}
              <TouchableOpacity
                style={styles.actionCircle}
                onPress={() => {
                  router.push({
                    pathname: "/phm/record-visit" as any,
                    params: { motherId: item.id, motherName: item.fullName },
                  });
                }}
              >
                <Text style={{ fontSize: 14 }}>📝</Text>
              </TouchableOpacity>

              {/* Schedule Appointment Button */}
              <TouchableOpacity
                style={styles.actionCircle}
                onPress={() => {
                  setSelectedMothers([item]);
                  setIsSelectingDate(true);
                  setDate(new Date());
                  setRemarks("");
                  setModalVisible(true);
                }}
              >
                <Text style={{ fontSize: 14 }}>📅</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  const renderProfile = () => (
    <View style={styles.profileContainer}>
      <View style={styles.profileTopCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {phmInfo?.fullName?.charAt(0) || "P"}
          </Text>
        </View>
        <Text style={styles.profileMainName}>{phmInfo?.fullName}</Text>
        <Text style={styles.profileMainId}>
          Public Health Midwife • ID:{" "}
          {phmInfo?.staffId || phmInfo?.registrationNumber || "Pending"}
        </Text>
      </View>

      <Text style={styles.sectionHeader}>ACCOUNT INFORMATION</Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoRowLeft}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoLabel}>Assigned Area</Text>
          </View>
          <Text style={styles.infoValue}>{phmInfo?.mohArea}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <View style={styles.infoRowLeft}>
            <Text style={styles.infoIcon}>📞</Text>
            <Text style={styles.infoLabel}>Phone Number</Text>
          </View>
          <Text style={styles.infoValue}>
            {phmInfo?.phoneNumber || "Not Set"}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>SECURITY & SETTINGS</Text>

      <TouchableOpacity
        style={styles.changePassBtn}
        onPress={() => router.push("/phm/change-password" as any)}
      >
        <Text style={styles.changePassText}>🔑 Change Password</Text>
        <Text style={styles.chevron}>›</Text>
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

        {activeTab === "Appointment" && (
          <PhmAppointments
            phmUserId={phmInfo?.user?.userId || phmInfo?.userId}
            refreshTrigger={refreshTrigger}
            onAddNew={() => {
              setSelectedMothers([]);
              setIsSelectingDate(false);
              setDate(new Date());
              setRemarks("");
              setModalVisible(true);
            }}
          />
        )}

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

      {/* --- Existing: Link Patient Modal --- */}
      <Modal
        visible={assignModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Link Patient</Text>
            <Text style={styles.modalSub}>
              Enter the mother's 12-digit NIC number to add her to your care
              list.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 199012345678"
              placeholderTextColor="#94A3B8"
              value={searchNic}
              onChangeText={setSearchNic}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setAssignModalVisible(false);
                  setSearchNic("");
                }}
                style={[styles.modalBtn, { backgroundColor: "#F1F5F9" }]}
              >
                <Text style={{ color: "#475569", fontWeight: "bold" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAssignMother}
                style={[styles.modalBtn, { backgroundColor: "#0056b3" }]}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Existing: Scheduling Modal --- */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Appointment</Text>

            {!isSelectingDate ? (
              <View>
                <View style={styles.selectAllHeaderRow}>
                  <Text style={styles.modalSub}>
                    Select patients to schedule:
                  </Text>
                  <TouchableOpacity onPress={toggleSelectAll}>
                    <Text style={styles.selectAllText}>
                      {selectedMothers.length === patients.length &&
                      patients.length > 0
                        ? "Deselect All"
                        : "Select All"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.patientListContainer}>
                  <FlatList
                    data={patients}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={({ item }) => {
                      const isSelected = selectedMothers.some(
                        (m) => m.id === item.id,
                      );
                      return (
                        <TouchableOpacity
                          style={[
                            styles.motherSelectBtn,
                            isSelected && styles.motherSelectBtnActive,
                          ]}
                          onPress={() => toggleMotherSelection(item)}
                        >
                          <View>
                            <Text
                              style={[
                                styles.motherSelectText,
                                isSelected && { color: "white" },
                              ]}
                            >
                              {item.fullName}
                            </Text>
                            <Text
                              style={[
                                styles.motherSelectNic,
                                isSelected && { color: "#E2E8F0" },
                              ]}
                            >
                              NIC: {item.nic}
                            </Text>
                          </View>
                          {isSelected && (
                            <Text style={styles.checkIcon}>✓</Text>
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>

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
                    disabled={selectedMothers.length === 0}
                    onPress={() => setIsSelectingDate(true)}
                    style={[
                      styles.modalBtn,
                      {
                        backgroundColor:
                          selectedMothers.length > 0 ? "#0056b3" : "#94A3B8",
                      },
                    ]}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Next ({selectedMothers.length})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <View style={styles.selectedMotherRow}>
                  <Text style={styles.modalSub}>
                    {selectedMothers.length === 1
                      ? `Patient: ${selectedMothers[0].fullName}`
                      : `Scheduling for ${selectedMothers.length} Patients`}
                  </Text>
                  <TouchableOpacity onPress={() => setIsSelectingDate(false)}>
                    <Text style={styles.changePatientText}>Edit List</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setPickerMode(Platform.OS === "ios" ? "datetime" : "date");
                    setShowPicker(!showPicker);
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
                    themeVariant="light"
                    textColor="#000000"
                  />
                )}

                <TextInput
                  style={styles.modalInput}
                  placeholder="Reason (e.g. Routine Clinic)"
                  placeholderTextColor="#94A3B8"
                  value={remarks}
                  onChangeText={setRemarks}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setIsSelectingDate(false)}
                    style={[styles.modalBtn, { backgroundColor: "#F1F5F9" }]}
                  >
                    <Text style={{ color: "#475569", fontWeight: "bold" }}>
                      Back
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
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  headerLocationText: {
    color: "#BBDEFB",
    fontSize: 11,
  },
  contentSection: {
    flex: 1,
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    elevation: 2,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0056b3",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },
  elegantAddBtn: {
    backgroundColor: "#EFF6FF",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  elegantAddBtnText: {
    color: "#1D4ED8",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
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
  patientName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#334155",
  },
  patientDetails: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  actionCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    height: 75,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    paddingBottom: 10,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIcon: {
    fontSize: 20,
    color: "#94A3B8",
  },
  tabLabel: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 4,
  },
  tabActiveText: {
    color: "#0056b3",
    fontWeight: "bold",
  },
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 5,
  },
  modalSub: {
    color: "#64748B",
    marginBottom: 15,
  },
  modalInput: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    color: "#333",
    width: "100%",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
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
  selectAllHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectAllText: {
    color: "#0056b3",
    fontWeight: "bold",
    marginBottom: 15,
  },
  patientListContainer: {
    maxHeight: 250,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
  },
  motherSelectBtn: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  motherSelectBtnActive: {
    backgroundColor: "#0056b3",
    borderBottomColor: "#004494",
  },
  motherSelectText: {
    fontWeight: "bold",
    color: "#1E293B",
    fontSize: 15,
  },
  motherSelectNic: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  checkIcon: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedMotherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  changePatientText: {
    color: "#0056b3",
    fontWeight: "bold",
    fontSize: 14,
  },
  profileContainer: {
    flex: 1,
    padding: 20,
  },
  profileTopCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginBottom: 25,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#0056b3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 4,
    borderColor: "#EFF6FF",
  },
  avatarText: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  profileMainName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 5,
  },
  profileMainId: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#94A3B8",
    marginLeft: 10,
    marginBottom: 10,
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  infoLabel: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  infoValue: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#1E293B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    width: "100%",
  },
  changePassBtn: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 15,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  changePassText: {
    color: "#0056b3",
    fontWeight: "bold",
    fontSize: 15,
  },
  chevron: {
    color: "#94A3B8",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: -2,
  },
  logoutBtn: {
    backgroundColor: "#FEF2F2",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: {
    color: "#DC2626",
    fontWeight: "bold",
    fontSize: 15,
  },
});
