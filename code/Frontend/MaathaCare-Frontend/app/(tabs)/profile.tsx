import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("userToken");

        // 🚨 ADD THESE TWO LINES TO SPY ON THE STORAGE:
        console.log("👉 1. The phone thinks the User ID is:", userId);
        console.log("👉 2. Does the phone have a Token?", token ? "YES" : "NO");

        // 🛡️ BLOCK the request if the token is missing or too short
        if (!token || token.split(".").length !== 3) {
          console.warn(
            "No valid JWT token found in storage. Redirecting to login...",
          );
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://10.163.129.223:8080/api/mothers/profile/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        console.log("Backend sent this profile data:", response.data);
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading)
    return (
      <ActivityIndicator size="large" color="#FF69B4" style={styles.centered} />
    );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mother's Profile</Text>
      <View style={styles.card}>
        <DetailItem label="Full Name" value={profile?.fullName} />
        <DetailItem label="NIC Number" value={profile?.nic} />
        <DetailItem label="Date of Birth" value={profile?.dateOfBirth} />
        <DetailItem label="Blood Group" value={profile?.bloodGroup} />
        <DetailItem
          label="Emergency Contact"
          value={profile?.emergencyContactNumber}
        />
        <DetailItem label="Home Address" value={profile?.address} />
        <DetailItem label="District" value={profile?.district} />
        <DetailItem label="Province" value={profile?.province} />
      </View>
    </ScrollView>
  );
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.itemContainer}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "Not provided"}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf2f8", padding: 20 },
  centered: { flex: 1, justifyContent: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#db2777",
    marginBottom: 20,
    marginTop: 40,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  itemContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  value: { fontSize: 18, color: "#374151", marginTop: 4 },
});
