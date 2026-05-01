import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar } from "react-native-calendars"; // 🌟 Custom Calendar Library

const API_BASE_URL = "http://172.20.10.2:8080";

interface Props {
  phmUserId: string;
  onAddNew: () => void;
  refreshTrigger?: number;
}

const isTimePassed = (appointment: any) => {
  if (!appointment || !appointment.fullDate || !appointment.time) return false;
  const dateParts = appointment.fullDate.split("-");
  const [time, period] = appointment.time.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const apptDate = new Date(
    parseInt(dateParts[0]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[2]),
    hours,
    parseInt(minutes, 10),
  );
  return new Date() >= apptDate;
};

export default function PhmAppointments({
  phmUserId,
  onAddNew,
  refreshTrigger,
}: Props) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  // Use state for the full 'YYYY-MM-DD' selection
  const todayDate = new Date().toISOString().split("T")[0];
  const [selectedFullDate, setSelectedFullDate] = useState(todayDate);
  const [selectedDayNum, setSelectedDayNum] = useState(
    String(new Date().getDate()).padStart(2, "0"),
  );

  useFocusEffect(
    useCallback(() => {
      if (phmUserId) loadAppointments();
    }, [phmUserId, refreshTrigger]),
  );

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const apptRes = await fetch(
        `${API_BASE_URL}/api/appointments/phm/${phmUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (apptRes.ok) setAppointments(await apptRes.json());
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 Logic to add dots to days with appointments
  const getMarkedDates = () => {
    const marked: any = {};
    appointments.forEach((appt) => {
      if (appt.fullDate) {
        marked[appt.fullDate] = { marked: true, dotColor: "#0056b3" };
      }
    });
    // Highlight the currently selected day
    marked[selectedFullDate] = {
      ...marked[selectedFullDate],
      selected: true,
      selectedColor: "#0056b3",
    };
    return marked;
  };

  const handleUpdateStatus = async (status: string) => {
    const token = await AsyncStorage.getItem("userToken");
    const res = await fetch(
      `${API_BASE_URL}/api/appointments/${selectedAppointment.id}/status?status=${status}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (res.ok) {
      setActionModalVisible(false);
      loadAppointments();
    }
  };

  const generateDateStrip = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 15; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      dates.push({
        dayName: nextDate.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: String(nextDate.getDate()).padStart(2, "0"),
        full: nextDate.toISOString().split("T")[0],
      });
    }
    return dates;
  };

  const filteredAppointments = showAll
    ? appointments
    : appointments.filter((app) => app.fullDate === selectedFullDate);

  return (
    <View style={styles.container}>
      {/* 15-Day Strip */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateSelectorContainer}
        >
          {generateDateStrip().map((item, index) => {
            const isSelected = selectedFullDate === item.full;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => {
                  setSelectedFullDate(item.full);
                  setSelectedDayNum(item.dayNumber);
                  setShowAll(false);
                }}
              >
                <Text style={[styles.dayName, isSelected && styles.textActive]}>
                  {item.dayName}
                </Text>
                <Text
                  style={[styles.dayNumber, isSelected && styles.textActive]}
                >
                  {item.dayNumber}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main List */}
      <View style={styles.listContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.listHeader}>
            {showAll ? "All Upcoming" : `Schedule: ${selectedFullDate}`}
          </Text>
          <TouchableOpacity
            onPress={() => setShowAll(!showAll)}
            style={[styles.toggleBtn, showAll && styles.toggleBtnActive]}
          >
            <Text
              style={[styles.toggleText, showAll && styles.toggleTextActive]}
            >
              {showAll ? "Show Daily" : "View All"}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.appointmentCard}
              onPress={() => {
                setSelectedAppointment(item);
                setActionModalVisible(true);
              }}
            >
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>{item.time.split(" ")[0]}</Text>
                <Text style={styles.amPmText}>{item.time.split(" ")[1]}</Text>
              </View>
              <View style={styles.detailsColumn}>
                <View style={styles.cardHeader}>
                  <Text style={styles.patientName}>{item.motherName}</Text>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          item.status === "COMPLETED" ? "#DCFCE7" : "#DBEAFE",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color:
                            item.status === "COMPLETED" ? "#15803D" : "#1D4ED8",
                        },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reasonText}>🩺 {item.reason}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No appointments for this date.</Text>
          }
        />
      </View>

      {/* Floating Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: "#F1F5F9", marginRight: 10 }]}
          onPress={() => setIsCalendarOpen(true)}
        >
          <Text style={{ fontSize: 24 }}>🗓️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={onAddNew}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* 🌟 CUSTOM CALENDAR MODAL */}
      <Modal visible={isCalendarOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <Calendar
              markedDates={getMarkedDates()}
              onDayPress={(day: any) => {
                setSelectedFullDate(day.dateString);
                setSelectedDayNum(String(day.day).padStart(2, "0"));
                setIsCalendarOpen(false);
              }}
              theme={{
                todayTextColor: "#0056b3",
                selectedDayBackgroundColor: "#0056b3",
                dotColor: "#0056b3",
              }}
            />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsCalendarOpen(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Action Modal (Simplified for space) */}
      <Modal visible={actionModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.actionContent}>
            <Text style={styles.modalTitle}>Update Appointment</Text>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#DCFCE7" }]}
              onPress={() => handleUpdateStatus("COMPLETED")}
            >
              <Text style={{ color: "#15803D", fontWeight: "bold" }}>
                Mark Completed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setActionModalVisible(false)}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  dateSelectorContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  dateCard: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minWidth: 65,
  },
  dateCardActive: { backgroundColor: "#0056b3", borderColor: "#0056b3" },
  dayName: { fontSize: 12, color: "#64748B" },
  dayNumber: { fontSize: 18, fontWeight: "bold", color: "#1E293B" },
  textActive: { color: "white" },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  listHeader: { fontSize: 16, fontWeight: "bold" },
  appointmentCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  timeColumn: {
    paddingRight: 15,
    borderRightWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  timeText: { fontSize: 18, fontWeight: "bold", color: "#0056b3" },
  amPmText: { fontSize: 10, color: "#64748B" },
  detailsColumn: { flex: 1, paddingLeft: 15 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  patientName: { fontWeight: "bold" },
  badge: { padding: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "bold" },
  reasonText: { fontSize: 13, color: "#475569" },
  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
  },
  fab: {
    backgroundColor: "#0056b3",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  fabIcon: { color: "white", fontSize: 24 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 20,
  },
  calendarCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    width: "90%",
  },
  actionContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "80%",
  },
  actionBtn: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  closeBtn: { marginTop: 10, alignItems: "center", padding: 10 },
  closeBtnText: { color: "#0056b3", fontWeight: "bold" },
  toggleBtn: { backgroundColor: "#E2E8F0", padding: 6, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: "#0056b3" },
  toggleText: { fontSize: 12 },
  toggleTextActive: { color: "white" },
  emptyText: { textAlign: "center", marginTop: 50, color: "#94A3B8" },
});
