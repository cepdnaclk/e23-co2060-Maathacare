import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clock, MapPin, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Appointment {
  id: string;
  date: string;
  time: string;
  location: string;
  phmName: string;
  notes: string;
}

export default function UpcomingClinicScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");
      const ip = "172.20.10.2"; // Your backend IP address

      if (!token || !userId) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://${ip}:8080/api/appointments/mother/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setAppointments(response.data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ED70A1" />
      </View>
    );
  }

  const nextAppointment = appointments.length > 0 ? appointments[0] : null;
  const futureAppointments =
    appointments.length > 1 ? appointments.slice(1) : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#665A7A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clinic Schedule</Text>
        <View style={{ width: 40 }} /> {/* Spacer for centering */}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar color="#D8B0D2" size={60} />
            <Text style={styles.emptyTitle}>No Clinics Scheduled</Text>
            <Text style={styles.emptySub}>
              Your midwife hasn't assigned your next visit yet.
            </Text>
          </View>
        ) : (
          <>
            {/* --- NEXT APPOINTMENT HERO CARD --- */}
            {nextAppointment && (
              <>
                <Text style={styles.sectionTitle}>Next Appointment</Text>
                <LinearGradient
                  colors={["#FFE2F1", "#E3F1FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroCard}
                >
                  <View style={styles.heroDateRow}>
                    <View style={styles.heroDateBadge}>
                      <Text style={styles.heroDateText}>
                        {nextAppointment.date
                          ? nextAppointment.date.split(" ")[0]
                          : "--"}
                      </Text>
                      <Text style={styles.heroMonthText}>
                        {nextAppointment.date
                          ? nextAppointment.date.split(" ")[1]
                          : "..."}
                      </Text>
                    </View>
                    <View style={styles.heroTimeWrap}>
                      <Clock size={16} color="#8A6FA8" />
                      <Text style={styles.heroTimeText}>
                        {nextAppointment.time}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <DetailRow
                    icon={<MapPin size={18} color="#D962A0" />}
                    text={nextAppointment.location}
                  />
                  <DetailRow
                    icon={<User size={18} color="#D962A0" />}
                    text={nextAppointment.phmName}
                  />

                  {/* 🌟 FIX: Safely handling empty notes using a ternary operator */}
                  {nextAppointment.notes ? (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesText}>
                        {nextAppointment.notes}
                      </Text>
                    </View>
                  ) : null}
                </LinearGradient>
              </>
            )}

            {/* --- FUTURE APPOINTMENTS LIST --- */}
            {futureAppointments.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Future Visits</Text>
                {futureAppointments.map((apt) => (
                  <View key={apt.id} style={styles.listCard}>
                    <View style={styles.listDateCol}>
                      <Text style={styles.listDateText}>
                        {apt.date ? apt.date.split(" ")[0] : "--"}
                      </Text>
                      <Text style={styles.listMonthText}>
                        {apt.date ? apt.date.split(" ")[1] : "..."}
                      </Text>
                    </View>
                    <View style={styles.listContentCol}>
                      <Text style={styles.listTimeText}>{apt.time}</Text>
                      <Text style={styles.listLocText}>{apt.location}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ icon, text }: { icon: any; text: string }) => (
  <View style={styles.detailRow}>
    <View style={styles.iconBox}>{icon}</View>
    <Text style={styles.detailText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF9FD" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9FD",
  },
  container: { flex: 1, paddingHorizontal: 22 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#665A7A" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#665A7A",
    marginTop: 10,
    marginBottom: 15,
  },

  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#D8B0D2",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroDateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heroDateBadge: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  heroDateText: { fontSize: 22, fontWeight: "800", color: "#D962A0" },
  heroMonthText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8A6FA8",
    textTransform: "uppercase",
  },
  heroTimeWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroTimeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#665A7A",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.8)",
    marginBottom: 20,
  },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailText: { fontSize: 15, fontWeight: "600", color: "#665B77" },
  notesBox: {
    marginTop: 5,
    backgroundColor: "rgba(255,255,255,0.5)",
    padding: 12,
    borderRadius: 12,
  },
  notesText: { fontSize: 13, color: "#8A6FA8", fontStyle: "italic" },

  listCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#EAE0F0",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    alignItems: "center",
  },
  listDateCol: {
    backgroundColor: "#FFF1F7",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    marginRight: 15,
  },
  listDateText: { fontSize: 18, fontWeight: "800", color: "#D962A0" },
  listMonthText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8A6FA8",
    textTransform: "uppercase",
  },
  listContentCol: { flex: 1 },
  listTimeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#665A7A",
    marginBottom: 4,
  },
  listLocText: { fontSize: 13, color: "#988FA8", fontWeight: "500" },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#665A7A",
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: "#988FA8",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
});
