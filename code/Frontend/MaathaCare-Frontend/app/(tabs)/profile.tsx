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
  TouchableOpacity, // 🟢 Added for the button
} from "react-native";
import { useRouter } from "expo-router"; // 🟢 Added for navigation

// 🌍 Use your current active IP
const API_BASE_URL = "http://10.161.201.226:8080";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // 🟢 Initialize router

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

  // 🟢 LOGOUT FUNCTION
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // 🛡️ Clears token, userId, and everything else
      router.replace("/"); // 🚀 Sends mother back to the Home/Login screen
    } catch (error) {
      console.error("Logout failed:", error);
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

        {/* 🟢 LOGOUT BUTTON ADDED HERE */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: "#fdf2f8",
    padding: 20
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    marginTop: 100
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#db2777",
    marginBottom: 20,
    marginTop: 40
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 40,
  },
  itemContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10
  },
  label: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
    textTransform: "uppercase"
  },
  value: {
      fontSize: 18,
      color: "#374151",
      marginTop: 4
    },
    logoutButton: {
      backgroundColor: "#ef4444",
      padding: 15,
      borderRadius: 10,
      marginTop: 20,
      alignItems: "center",
    },
    logoutText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
  });