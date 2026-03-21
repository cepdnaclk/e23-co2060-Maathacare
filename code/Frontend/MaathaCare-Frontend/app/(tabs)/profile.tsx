import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// 🌍 Use your current active IP
const API_BASE_URL = "http://10.163.129.223:8080";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // 🔑 Pulling keys from the AsyncStorage "Vault"
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");

      console.log("🔍 Checking Profile Storage - ID:", userId, "Token exists:", !!token);

      // 🛡️ Security Guard: If no token, stop the request early
      if (!token || !userId) {
        Alert.alert("Session Expired", "Please log in again.");
        setLoading(false);
        return;
      }

      // 🛑 Requesting data with the 'Bearer' token as a VIP pass
      const response = await axios.get(
        `${API_BASE_URL}/api/mothers/profile/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProfile(response.data);
    } catch (error: any) {
      console.error("Profile Fetch Error:", error);
      // Handle 403 Forbidden (Token invalid/expired)
      if (error.response?.status === 403) {
        Alert.alert("Security Error", "Your session has expired. Please log in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <ActivityIndicator size="large" color="#FF69B4" style={styles.centered} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mother's Profile</Text>
      <View style={styles.card}>
        <DetailItem label="Full Name" value={profile?.fullName} />
        <DetailItem label="NIC Number" value={profile?.nic} />
        <DetailItem label="Blood Group" value={profile?.bloodGroup} />
        <DetailItem label="Emergency Contact" value={profile?.emergencyContactNumber} />
        <DetailItem label="Address" value={profile?.address} />
        <DetailItem label="District" value={profile?.district} />
        <DetailItem label="Province" value={profile?.province} />
      </View>
    </ScrollView>
  );
}

// 🎨 Helper component for clean rows
const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.itemContainer}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "Not provided"}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf2f8", padding: 20 },
  centered: { flex: 1, justifyContent: "center", marginTop: 100 },
  title: { fontSize: 26, fontWeight: "bold", color: "#db2777", marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: "white", borderRadius: 15, padding: 20, elevation: 4 },
  itemContainer: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", paddingBottom: 10 },
  label: { fontSize: 12, color: "#9ca3af", fontWeight: "600", textTransform: "uppercase" },
  value: { fontSize: 18, color: "#374151", marginTop: 4 },
});